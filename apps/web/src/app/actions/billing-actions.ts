'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { realtimeHub } from '@amisi/realtime';
import { getResolvedTenantId } from '@/lib/tenant';
import { postInventoryJournalEntry } from './accounting-bridge';

// ---------------------------------------------------------------------------
// CHARGE CAPTURE — Individual ClaimItem billing per service
// ---------------------------------------------------------------------------

export async function captureCharge(data: {
    patientId: string;
    encounterId?: string;
    description: string;
    cptCode?: string;
    icd10Code?: string;
    quantity?: number;
    unitPrice: number;
    isTaxable?: boolean;
}) {
    await ensureRole(['DOCTOR', 'NURSE', 'ADMIN']);
    const db = await getTenantDb();

    // Find or create the FinancialRecord for this encounter
    let record = await db.financialRecord.findFirst({
        where: data.encounterId ? { encounterId: data.encounterId } : { patientId: data.patientId }
    });

    if (!record) {
        record = await db.financialRecord.create({
            data: {
                patientId: data.patientId,
                encounterId: data.encounterId,
                totalAmount: 0,
                balanceDue: 0,
                status: 'pending',
            }
        });
    }

    const quantity = data.quantity ?? 1;
    const subtotal = quantity * data.unitPrice;

    const item = await db.invoiceItem.create({
        data: {
            financialRecordId: record.id,
            description: data.description,
            quantity,
            unitPrice: data.unitPrice,
            subtotal,
            isTaxable: data.isTaxable ?? false,
            paymentStatus: 'UNPAID',
        }
    });

    // Update financial record totals
    await db.financialRecord.update({
        where: { id: record.id },
        data: {
            totalAmount: { increment: subtotal },
            balanceDue: { increment: subtotal }
        }
    });

    // Post AR Clinical Charge JE (ASC 606 / IFRS 15)
    await postInventoryJournalEntry({
        type: 'CLINICAL_CHARGE',
        sourceId: item.id,
        amount: subtotal,
        description: `Charge: ${data.description}`,
        fiscalPeriod: new Date().toISOString().slice(0, 7)
    });

    await logAudit({
        action: 'CREATE', resource: 'InvoiceItem', resourceId: item.id,
        details: { description: data.description, cptCode: data.cptCode, icd10Code: data.icd10Code, subtotal }
    });

    revalidatePath(`/patients/${data.patientId}`);
    return item;
}

// ---------------------------------------------------------------------------
// CLAIM SCRUBBING — CMS coding validation before submission
// ---------------------------------------------------------------------------

export async function scrubClaim(financialRecordId: string) {
    const db = await getTenantDb();
    const record = await db.financialRecord.findUnique({
        where: { id: financialRecordId },
        include: { items: true }
    });

    if (!record) throw new Error('Financial record not found');

    const errors: string[] = [];

    for (const item of record.items) {
        // Flag items with no CPT/ICD-10 (CMS requirement)
        // Note: these fields will be available after pnpm db:generate completes
        if (!('cptCode' in item) || !(item as any).cptCode) {
            errors.push(`"${item.description}": Missing CPT procedure code`);
        }
        if (!('icd10Code' in item) || !(item as any).icd10Code) {
            errors.push(`"${item.description}": Missing ICD-10 diagnosis code`);
        }
    }

    const valid = errors.length === 0;

    await logAudit({
        action: 'READ', resource: 'FinancialRecord', resourceId: financialRecordId,
        details: { action: 'CLAIM_SCRUB', valid, errorCount: errors.length }
    });

    return { valid, errors, itemCount: record.items.length };
}

// ---------------------------------------------------------------------------
// PAYMENT RECORDING — Per-service or bulk, with automatic JE
// ---------------------------------------------------------------------------

export async function recordPayment(data: {
    financialRecordId: string;
    amount: number;
    method: string; // 'CASH', 'CARD', 'INSURANCE', 'MOBILE_MONEY'
    reference?: string;
    isInsurance?: boolean;
    contractualAdjustment?: number; // Amount insurance won't pay
}) {
    await ensureRole(['ACCOUNTANT', 'ADMIN']);
    const db = await getTenantDb();

    const record = await db.financialRecord.findUnique({
        where: { id: data.financialRecordId }
    });
    if (!record) throw new Error('Financial record not found');

    const fiscalPeriod = new Date().toISOString().slice(0, 7);

    await db.$transaction(async (tx: any) => {
        // 1. Create payment entry
        await tx.payment.create({
            data: {
                financialRecordId: data.financialRecordId,
                amount: data.amount,
                method: data.method,
                reference: data.reference,
            }
        });

        // 2. Reduce balance due
        const newBalance = Number(record.balanceDue) - data.amount - (data.contractualAdjustment ?? 0);
        await tx.financialRecord.update({
            where: { id: data.financialRecordId },
            data: {
                balanceDue: newBalance,
                status: newBalance <= 0 ? 'paid' : 'partial'
            }
        });
    });

    // 3. Post payment JE (Cash DR, AR CR)
    await postInventoryJournalEntry({
        type: data.isInsurance ? 'INSURANCE_PAYMENT' : 'PATIENT_PAYMENT',
        sourceId: data.financialRecordId,
        amount: data.amount,
        description: `Payment via ${data.method}: Record ${data.financialRecordId}`,
        fiscalPeriod
    });

    // 4. Post contractual adjustment JE if applicable
    if (data.contractualAdjustment && data.contractualAdjustment > 0) {
        await postInventoryJournalEntry({
            type: 'CONTRACTUAL_ADJUST',
            sourceId: data.financialRecordId,
            amount: data.contractualAdjustment,
            description: `Insurance contractual adj.: ${data.financialRecordId}`,
            fiscalPeriod
        });
    }

    await logAudit({
        action: 'CREATE', resource: 'Payment', resourceId: data.financialRecordId,
        details: { amount: data.amount, method: data.method, contractualAdjustment: data.contractualAdjustment }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) {
        realtimeHub.broadcast(tenantId, 'PAYMENT_RECEIVED', 'FinancialRecord', data.financialRecordId);
    }

    revalidatePath('/billing');
}

// ---------------------------------------------------------------------------
// INVOICE GENERATION — Per-patient itemized bill
// ---------------------------------------------------------------------------

export async function getPatientInvoice(patientId: string) {
    const db = await getTenantDb();
    return db.financialRecord.findMany({
        where: { patientId },
        include: {
            items: { orderBy: { createdAt: 'asc' } },
            payments: { orderBy: { createdAt: 'asc' } },
            patient: true,
        },
        orderBy: { createdAt: 'desc' }
    });
}

// ---------------------------------------------------------------------------
// A/R AGING DASHBOARD (0-30, 31-60, 61-90, 90+ days)
// ---------------------------------------------------------------------------

export async function getARAgingReport() {
    const db = await getTenantDb();
    const allUnpaid = await db.financialRecord.findMany({
        where: { status: { not: 'paid' }, balanceDue: { gt: 0 } },
        include: { patient: { select: { firstName: true, lastName: true, mrn: true } } }
    });

    const now = new Date();
    const buckets = { d0_30: [] as any[], d31_60: [] as any[], d61_90: [] as any[], over90: [] as any[] };

    for (const r of allUnpaid) {
        const ageDays = Math.floor((now.getTime() - r.createdAt.getTime()) / 86400000);
        if (ageDays <= 30) buckets.d0_30.push(r);
        else if (ageDays <= 60) buckets.d31_60.push(r);
        else if (ageDays <= 90) buckets.d61_90.push(r);
        else buckets.over90.push(r);
    }

    return buckets;
}

export async function getInvoiceById(id: string) {
    const db = await getTenantDb();
    return db.financialRecord.findUnique({
        where: { id },
        include: { items: true, payments: true, patient: true }
    });
}

export async function recordServiceLevelPayment(invoiceItemId: string, amount: number, method?: string) {
    const db = await getTenantDb();
    return db.invoiceItem.update({
        where: { id: invoiceItemId },
        data: { paymentStatus: 'PAID' }
    });
}

export async function getHospitalRevenueStats() {
    const db = await getTenantDb();
    
    const paid = await db.financialRecord.aggregate({
        where: { status: 'paid' },
        _sum: { totalAmount: true }
    });
    
    const unpaid = await db.financialRecord.aggregate({
        where: { status: { not: 'paid' } },
        _sum: { balanceDue: true }
    });

    const totalInvoicedAgg = await db.financialRecord.aggregate({
        _sum: { totalAmount: true }
    });

    const recentInvoices = await db.financialRecord.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { patient: true }
    });

    return {
        totalReceived: Number(paid._sum.totalAmount || 0),
        outstanding: Number(unpaid._sum.balanceDue || 0),
        totalInvoiced: Number(totalInvoicedAgg._sum.totalAmount || 0),
        recentInvoices
    };
}

export async function createInvoice(patientId: string, encounterId: string | null, items: any[]) {
    await ensureRole(['ADMIN', 'ACCOUNTANT', 'DOCTOR']);
    const db = await getTenantDb();

    // 1. Calculate Summary
    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const tax = items.reduce((acc, item) => {
        if (!item.isTaxable) return acc;
        return acc + (item.quantity * item.unitPrice * (item.taxRate / 100));
    }, 0);
    const totalAmount = subtotal + tax;

    return await db.$transaction(async (tx: any) => {
        // 2. Create the shell Financial Record
        const record = await tx.financialRecord.create({
            data: {
                patientId,
                encounterId: encounterId || undefined,
                totalAmount,
                balanceDue: totalAmount,
                status: 'pending',
            }
        });

        // 3. Create all itemized child charges
        for (const item of items) {
            await tx.invoiceItem.create({
                data: {
                    financialRecordId: record.id,
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    subtotal: item.quantity * item.unitPrice,
                    paymentStatus: 'UNPAID',
                }
            });
        }

        // 4. Persistence Hook (Accounting Bridge)
        await postInventoryJournalEntry({
            type: 'CLINICAL_CHARGE',
            sourceId: record.id,
            amount: totalAmount,
            description: `Aggregated Invoice for ${patientId}`,
            fiscalPeriod: new Date().toISOString().slice(0, 7)
        });

        return record;
    });
}
