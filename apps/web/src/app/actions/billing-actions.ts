'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { realtimeHub } from '@amisimedos/chat';
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

    // Find or create the Invoice for this encounter
    let record = await db.invoice.findFirst({
        where: data.encounterId ? { encounterId: data.encounterId } : { patientId: data.patientId }
    });

    if (!record) {
        record = await db.invoice.create({
            data: {
                patientId: data.patientId,
                encounterId: data.encounterId,
                totalAmount: 0,
                balanceDue: 0,
                status: 'OPEN',
            }
        });
    }

    const quantity = data.quantity ?? 1;
    const subtotal = quantity * data.unitPrice;

    const item = await db.billItem.create({
        data: {
            invoiceId: record.id,
            visitId: data.encounterId || '', // Assuming encounterId as visitId for now in this legacy action
            description: data.description,
            quantity,
            unitPrice: data.unitPrice,
            totalPrice: subtotal,
            category: 'GENERAL',
            status: 'UNPAID',
        }
    });

    // Update invoice totals
    await db.invoice.update({
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

export async function scrubClaim(invoiceId: string) {
    const db = await getTenantDb();
    const record = await db.invoice.findUnique({
        where: { id: invoiceId },
        include: { billItems: true }
    });

    if (!record) throw new Error('Invoice not found');

    const errors: string[] = [];

    for (const item of record.billItems) {
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
        action: 'READ', resource: 'Invoice', resourceId: invoiceId,
        details: { action: 'CLAIM_SCRUB', valid, errorCount: errors.length }
    });

    return { valid, errors, itemCount: record.billItems.length };
}

// ---------------------------------------------------------------------------
// PAYMENT RECORDING — Per-service or bulk, with automatic JE
// ---------------------------------------------------------------------------

export async function recordPayment(data: {
    invoiceId: string;
    amount: number;
    method: string; // 'CASH', 'CARD', 'INSURANCE', 'MOBILE_MONEY'
    reference?: string;
    isInsurance?: boolean;
    contractualAdjustment?: number; // Amount insurance won't pay
}) {
    await ensureRole(['ACCOUNTANT', 'ADMIN']);
    const db = await getTenantDb();

    const record = await db.invoice.findUnique({
        where: { id: data.invoiceId }
    });
    if (!record) throw new Error('Invoice not found');

    const fiscalPeriod = new Date().toISOString().slice(0, 7);

    await db.$transaction(async (tx: any) => {
        // 1. Create payment entry
        await tx.payment.create({
            data: {
                invoiceId: data.invoiceId,
                amount: data.amount,
                method: data.method,
                reference: data.reference,
            }
        });

        // 2. Reduce balance due
        const newBalance = Number(record.balanceDue) - data.amount - (data.contractualAdjustment ?? 0);
        await tx.invoice.update({
            where: { id: data.invoiceId },
            data: {
                balanceDue: newBalance,
                status: newBalance <= 0 ? 'PAID' : 'PARTIAL'
            }
        });
    });

    // 3. Post payment JE (Cash DR, AR CR)
    await postInventoryJournalEntry({
        type: data.isInsurance ? 'INSURANCE_PAYMENT' : 'PATIENT_PAYMENT',
        sourceId: data.invoiceId,
        amount: data.amount,
        description: `Payment via ${data.method}: Invoice ${data.invoiceId}`,
        fiscalPeriod
    });

    // 4. Post contractual adjustment JE if applicable
    if (data.contractualAdjustment && data.contractualAdjustment > 0) {
        await postInventoryJournalEntry({
            type: 'CONTRACTUAL_ADJUST',
            sourceId: data.invoiceId,
            amount: data.contractualAdjustment,
            description: `Insurance contractual adj.: ${data.invoiceId}`,
            fiscalPeriod
        });
    }

    await logAudit({
        action: 'CREATE', resource: 'Payment', resourceId: data.invoiceId,
        details: { amount: data.amount, method: data.method, contractualAdjustment: data.contractualAdjustment }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) {
        realtimeHub.broadcast(tenantId, 'PAYMENT_RECEIVED', 'Invoice', data.invoiceId);
    }

    revalidatePath('/billing');
}

// ---------------------------------------------------------------------------
// INVOICE GENERATION — Per-patient itemized bill
// ---------------------------------------------------------------------------

export async function getPatientInvoice(patientId: string) {
    const db = await getTenantDb();
    return db.invoice.findMany({
        where: { patientId },
        include: {
            billItems: { orderBy: { createdAt: 'asc' } },
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
    const allUnpaid = await db.invoice.findMany({
        where: { status: { not: 'PAID' }, balanceDue: { gt: 0 } },
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
    return db.invoice.findUnique({
        where: { id },
        include: { billItems: true, payments: true, patient: true }
    });
}

export async function recordServiceLevelPayment(billItemId: string, amount: number, method?: string) {
    const db = await getTenantDb();
    return db.billItem.update({
        where: { id: billItemId },
        data: { status: 'PAID' }
    });
}

export async function getHospitalRevenueStats() {
    const db = await getTenantDb();
    
    const paid = await db.invoice.aggregate({
        where: { status: 'PAID' },
        _sum: { totalAmount: true }
    });
    
    const unpaid = await db.invoice.aggregate({
        where: { status: { not: 'PAID' } },
        _sum: { balanceDue: true }
    });

    const totalInvoicedAgg = await db.invoice.aggregate({
        _sum: { totalAmount: true }
    });

    const recentInvoices = await db.invoice.findMany({
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
        // 2. Create the shell Invoice
        const record = await tx.invoice.create({
            data: {
                patientId,
                encounterId: encounterId || undefined,
                totalAmount,
                balanceDue: totalAmount,
                status: 'OPEN',
            }
        });

        // 3. Create all itemized child charges
        for (const item of items) {
            await tx.billItem.create({
                data: {
                    invoiceId: record.id,
                    visitId: encounterId || '', // Simplified for this legacy action
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.quantity * item.unitPrice,
                    status: 'UNPAID',
                    category: 'GENERAL',
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
