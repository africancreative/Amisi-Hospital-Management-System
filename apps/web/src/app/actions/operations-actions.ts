'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getServerUser, ensureRole } from '@/lib/auth-utils';
import { Decimal } from '@amisimedos/db/client';

// ─── BILLING & FINANCE ACTIONS ───────────────────────────────────────────────

export async function getInvoiceById(id: string): Promise<any> {
    const db = await getTenantDb();
    const invoice = await db.invoice.findUnique({ where: { id }, include: { billItems: true, payments: true, patient: true } });
    if (!invoice) return null;
    return {
        ...invoice,
        items: invoice.billItems.map((i: any) => ({
            id: i.id,
            description: i.description,
            subtotal: i.totalPrice,
            paidAmount: i.status === 'PAID' ? i.totalPrice : 0,
            paymentStatus: i.status
        }))
    };
}

export async function processPayment(invoiceId: string, data: { method: string; amount: number; reference?: string; }): Promise<any> {
    const db = await getTenantDb();
    const payment = await db.payment.create({ data: { invoiceId, amount: data.amount, method: data.method, reference: data.reference, currency: 'KES' } });
    await db.invoice.update({ where: { id: invoiceId }, data: { status: data.method === 'INSURANCE' ? 'PARTIAL' : 'PAID', balanceDue: 0 } });
    await db.billItem.updateMany({ where: { invoiceId }, data: { status: 'PAID' } });
    return { success: true, paymentId: payment.id };
}

export async function recordServiceLevelPayment(itemId: string, amount: number, method: string): Promise<any> {
    const db = await getTenantDb();
    const item = await db.billItem.findUnique({ where: { id: itemId } });
    if (!item) throw new Error("Bill item not found");
    const payment = await db.payment.create({
        data: { invoiceId: item.invoiceId as string, amount, method, currency: 'KES', reference: `ITEM_PAYMENT_${itemId.slice(0, 5)}` }
    });
    if (amount >= Number(item.totalPrice)) {
        await db.billItem.update({ where: { id: itemId }, data: { status: 'PAID' } });
    }
    return { success: true, paymentId: payment.id };
}

export async function createInvoice(patientId: string, visitId: string | null, items: any[]): Promise<any> {
    const db = await getTenantDb();
    const totalAmount = items.reduce((acc: any, item: any) => acc + (item.quantity * item.unitPrice), 0);
    const invoice = await db.invoice.create({
        data: {
            patientId,
            visitId,
            totalAmount,
            balanceDue: totalAmount,
            status: 'UNPAID',
            currency: 'KES',
            billItems: {
                create: items.map((item: any) => ({
                    visitId: visitId || '',
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.quantity * item.unitPrice,
                    category: 'SERVICE',
                    status: 'UNPAID',
                    currency: 'KES'
                }))
            }
        }
    });
    revalidatePath('/billing');
    return invoice;
}

// ─── ACCOUNTING ACTIONS ──────────────────────────────────────────────────────

export async function getRecentJournalEntries(): Promise<any> {
    await ensureRole(['ACCOUNTANT', 'ADMIN']);
    const db = await getTenantDb();
    return db.journalEntry.findMany({ take: 20, orderBy: { createdAt: 'desc' }, include: { lines: { include: { account: true } } } });
}

export async function getTrialBalance(): Promise<any> {
    await ensureRole(['ACCOUNTANT', 'ADMIN']);
    const db = await getTenantDb();
    const accounts = await db.account.findMany({ include: { journalLines: true } });
    return accounts.map((acc: any) => {
        const totalDebit = acc.journalLines.reduce((sum: any, l: any) => sum + Number(l.debit), 0);
        const totalCredit = acc.journalLines.reduce((sum: any, l: any) => sum + Number(l.credit), 0);
        const balance = ['ASSET', 'EXPENSE'].includes(acc.type) ? totalDebit - totalCredit : totalCredit - totalDebit;
        return { ...acc, totalDebit, totalCredit, balance };
    });
}


// ─── SCM & INVENTORY ACTIONS ─────────────────────────────────────────────────

export async function getInventoryItems(): Promise<any[]> {
    const db = await getTenantDb();
    return db.inventoryItem.findMany({ orderBy: { name: 'asc' } });
}

// ─── HR & STAFF ACTIONS ──────────────────────────────────────────────────────

export async function getEmployees(): Promise<any> {
    await ensureRole(['ADMIN', 'HR_MANAGER']);
    const db = await getTenantDb();
    return db.employee.findMany({ orderBy: [{ role: 'asc' }, { lastName: 'asc' }] });
}

export async function getStaffActivity(staffId: string): Promise<any> {
    await ensureRole(['ADMIN', 'HR_MANAGER']);
    const db = await getTenantDb();
    return db.auditLog.findMany({ where: { actorId: staffId }, take: 20, orderBy: { timestamp: 'desc' } });
}
