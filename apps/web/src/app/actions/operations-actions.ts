'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getServerUser, ensureRole } from '@/lib/auth-utils';
import { Decimal } from '@amisimedos/db/client';

// ─── BILLING & FINANCE ACTIONS ───────────────────────────────────────────────

export async function processPayment(invoiceId: string, data: { method: string; amount: number; reference?: string; }): Promise<any> {
    const db = await getTenantDb();
    const payment = await db.payment.create({ data: { invoiceId, amount: data.amount, method: data.method, reference: data.reference, currency: 'KES' } });
    await db.invoice.update({ where: { id: invoiceId }, data: { status: data.method === 'INSURANCE' ? 'PARTIAL' : 'PAID', balanceDue: 0 } });
    return { success: true, paymentId: payment.id };
}

export async function createInvoice(data: { patientId: string; items: any[]; }): Promise<any> {
    const db = await getTenantDb();
    const total = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const invoice = await db.invoice.create({
        data: { patientId: data.patientId, totalAmount: new Decimal(total), balanceDue: new Decimal(total), status: 'PENDING', billItems: { create: data.items } }
    });
    revalidatePath(`/patients/${data.patientId}`);
    return invoice;
}

// ─── SCM & INVENTORY ACTIONS ─────────────────────────────────────────────────

export async function updateStockLevel(itemId: string, adjustment: number): Promise<any> {
    await ensureRole(['PHARMACIST', 'SCM_MANAGER', 'ADMIN']);
    const db = await getTenantDb();
    const item = await db.inventoryItem.update({ where: { id: itemId }, data: { currentStock: { increment: adjustment } } });
    revalidatePath('/inventory');
    return item;
}

export async function requestStock(data: { itemId: string; quantity: number; wardId?: string; }): Promise<any> {
    const db = await getTenantDb();
    const request = await db.stockRequest.create({ data: { itemId: data.itemId, requestedQuantity: data.quantity, status: 'PENDING', destinationWardId: data.wardId } });
    revalidatePath('/inventory/requests');
    return request;
}

// ─── HR & STAFF ACTIONS ──────────────────────────────────────────────────────

export async function getStaffActivity(staffId: string): Promise<any> {
    await ensureRole(['ADMIN', 'HR_MANAGER']);
    const db = await getTenantDb();
    return db.auditLog.findMany({ where: { userId: staffId }, take: 20, orderBy: { timestamp: 'desc' } });
}
