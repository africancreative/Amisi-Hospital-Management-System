'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getServerUser } from '@/lib/auth-utils';

export async function processPayment(invoiceId: string, data: {
    method: 'CASH' | 'CARD' | 'MPESA' | 'INSURANCE';
    amount: number;
    reference?: string;
    insuranceDetails?: {
        provider: string;
        policyNumber: string;
        preAuthCode?: string;
    };
}) {
    const db = await getTenantDb();
    const user = await getServerUser();

    // 1. Record the payment
    const payment = await db.payment.create({
        data: {
            invoiceId,
            amount: data.amount,
            method: data.method,
            reference: data.reference || (data.method === 'INSURANCE' ? data.insuranceDetails?.policyNumber : undefined),
            currency: 'KES',
        }
    });

    // 2. Update invoice status
    const invoice = await db.invoice.update({
        where: { id: invoiceId },
        data: {
            status: data.method === 'INSURANCE' ? 'PARTIAL' : 'PAID', // Insurance usually takes time to settle
            balanceDue: 0, // Simplified for this dashboard
            payerType: data.method === 'INSURANCE' ? 'INSURANCE' : 'CASH',
            insurancePolicyNumber: data.insuranceDetails?.policyNumber,
            preAuthCode: data.insuranceDetails?.preAuthCode,
        }
    });

    // 3. Mark all related BillItems as paid
    await db.billItem.updateMany({
        where: { invoiceId },
        data: { status: 'PAID' }
    });

    return { success: true, paymentId: payment.id };
}

export async function addBillItem(invoiceId: string, data: {
    description: string;
    quantity: number;
    unitPrice: number;
    category: string;
    visitId: string;
}) {
    const db = await getTenantDb();
    
    const item = await db.billItem.create({
        data: {
            invoiceId,
            visitId: data.visitId,
            description: data.description,
            quantity: data.quantity,
            unitPrice: data.unitPrice,
            totalPrice: data.quantity * data.unitPrice,
            category: data.category,
            status: 'UNPAID',
            currency: 'KES'
        }
    });

    // Update invoice total
    const invoice = await db.invoice.findUnique({ where: { id: invoiceId }, include: { billItems: true } });
    if (invoice) {
        const newTotal = invoice.billItems.reduce((acc, i) => acc + Number(i.totalPrice), 0);
        await db.invoice.update({
            where: { id: invoiceId },
            data: { totalAmount: newTotal, balanceDue: newTotal }
        });
    }

    return item;
}

export async function getInvoiceById(id: string) {
    const db = await getTenantDb();
    const invoice = await db.invoice.findUnique({
        where: { id },
        include: {
            billItems: true,
            patient: true,
            payments: true
        }
    });

    if (!invoice) return null;

    return {
        ...invoice,
        items: invoice.billItems.map(i => ({
            id: i.id,
            description: i.description,
            subtotal: i.totalPrice,
            paidAmount: i.status === 'PAID' ? i.totalPrice : 0, // Simplified
            paymentStatus: i.status
        }))
    };
}

export async function recordServiceLevelPayment(itemId: string, amount: number, method: string) {
    const db = await getTenantDb();
    const user = await getServerUser();

    const item = await db.billItem.findUnique({ where: { id: itemId } });
    if (!item) throw new Error("Bill item not found");

    // Record partial or full payment for a specific item
    const payment = await db.payment.create({
        data: {
            invoiceId: item.invoiceId as string,
            amount,
            method,
            currency: 'KES',
            reference: `ITEM_PAYMENT_${itemId.slice(0, 5)}`
        }
    });

    // If fully paid, update item status
    if (amount >= Number(item.totalPrice)) {
        await db.billItem.update({
            where: { id: itemId },
            data: { status: 'PAID' }
        });
    }

    return { success: true, paymentId: payment.id };
}

export async function createInvoice(patientId: string, visitId: string | null, items: any[]) {
    const db = await getTenantDb();
    
    const totalAmount = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

    const invoice = await db.invoice.create({
        data: {
            patientId,
            visitId,
            totalAmount,
            balanceDue: totalAmount,
            status: 'UNPAID',
            currency: 'KES',
            billItems: {
                create: items.map(item => ({
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
