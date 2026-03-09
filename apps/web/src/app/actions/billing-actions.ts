'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole } from '@/lib/auth-utils';
import { Decimal } from '@amisi/database';

import { getStandardAccount, postJournalEntry } from './accounting-actions';

export async function getHospitalRevenueStats() {
    await ensureRole(['ACCOUNTANT', 'ADMIN']);
    const db = await getTenantDb();
    const records = await db.financialRecord.findMany({
        include: { payments: true, items: true },
        orderBy: { createdAt: 'desc' }
    });

    const totalInvoiced = records.reduce((acc: number, r: any) => acc + Number(r.totalAmount), 0);
    const totalReceived = records.reduce((acc: number, r: any) =>
        acc + r.payments.reduce((pAcc: number, p: any) => pAcc + Number(p.amount), 0), 0
    );

    return {
        totalInvoiced,
        totalReceived,
        outstanding: totalInvoiced - totalReceived,
        recentInvoices: records.slice(0, 5),
    };
}

export async function getInvoiceById(id: string) {
    await ensureRole(['ACCOUNTANT', 'ADMIN']);
    const db = await getTenantDb();
    return await db.financialRecord.findUnique({
        where: { id },
        include: {
            items: true,
            payments: true,
            patient: true
        }
    });
}

export async function createInvoice(
    patientId: string,
    encounterId: string | null,
    items: {
        description: string,
        quantity: number,
        unitPrice: number,
        paymentMode?: 'PREPAID' | 'POSTPAID',
        isTaxable?: boolean,
        taxRate?: number
    }[]
) {
    await ensureRole(['ACCOUNTANT', 'ADMIN']);
    const db = await getTenantDb();

    // Calculate total including tax per item
    const totalAmount = items.reduce((acc, item) => {
        const subtotal = item.quantity * item.unitPrice;
        const tax = item.isTaxable ? (subtotal * (item.taxRate || 0)) / 100 : 0;
        return acc + subtotal + tax;
    }, 0);

    const record = await db.financialRecord.create({
        data: {
            patientId,
            encounterId,
            totalAmount: new Decimal(totalAmount),
            balanceDue: new Decimal(totalAmount),
            status: 'pending',
            items: {
                create: items.map(item => {
                    const subtotal = item.quantity * item.unitPrice;
                    const taxAmt = item.isTaxable ? (subtotal * (item.taxRate || 0)) / 100 : 0;
                    return {
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: new Decimal(item.unitPrice),
                        subtotal: new Decimal(subtotal + taxAmt),
                        paymentMode: item.paymentMode || 'POSTPAID',
                        isTaxable: item.isTaxable || false,
                        taxRate: new Decimal(item.taxRate || 0),
                        paymentStatus: 'UNPAID',
                        paidAmount: new Decimal(0),
                    };
                })
            }
        }
    });

    // Automated Accounting Posting: 
    // Debit: Accounts Receivable (1100)
    // Credit: Medical Services Revenue (4000)
    const arAccount = await getStandardAccount('1100', 'Accounts Receivable', 'ASSET');
    const revenueAccount = await getStandardAccount('4000', 'Medical Services Revenue', 'REVENUE');

    await postJournalEntry({
        description: `Invoice ${record.id} for patient ${patientId}`,
        date: new Date(),
        reference: record.id,
        sourceType: 'BILLING',
        sourceId: record.id,
        lines: [
            { accountId: arAccount.id, debit: totalAmount, credit: 0, description: 'Patient service charge' },
            { accountId: revenueAccount.id, debit: 0, credit: totalAmount, description: 'Medical service revenue' }
        ]
    });

    revalidatePath(`/patients/${patientId}`);
    revalidatePath('/billing');
    return record;
}

export async function recordPayment(financialRecordId: string, amount: number, method: string) {
    await ensureRole(['ACCOUNTANT', 'ADMIN']);
    const db = await getTenantDb();

    const payment = await db.payment.create({
        data: {
            financialRecordId,
            amount: new Decimal(amount),
            method,
        }
    });

    // Automated Accounting Posting:
    // Debit: Cash & Bank (1010)
    // Credit: Accounts Receivable (1100)
    const cashAccount = await getStandardAccount('1010', 'Cash & Bank', 'ASSET');
    const arAccount = await getStandardAccount('1100', 'Accounts Receivable', 'ASSET');

    await postJournalEntry({
        description: `Payment for invoice ${financialRecordId}`,
        date: new Date(),
        reference: payment.id,
        sourceType: 'BILLING',
        sourceId: payment.id,
        lines: [
            { accountId: cashAccount.id, debit: amount, credit: 0, description: `Payment via ${method}` },
            { accountId: arAccount.id, debit: 0, credit: amount, description: 'Clearing patient balance' }
        ]
    });

    // Update balance due on the main record
    const record = await db.financialRecord.findUnique({
        where: { id: financialRecordId },
        include: { payments: true }
    });

    if (record) {
        const totalPaid = record.payments.reduce((acc: number, p: any) => acc + Number(p.amount), 0);
        const totalAmount = Number(record.totalAmount);
        const newBalance = totalAmount - totalPaid;

        let status = 'partial';
        if (newBalance <= 0) status = 'paid';

        await db.financialRecord.update({
            where: { id: financialRecordId },
            data: {
                balanceDue: new Decimal(newBalance),
                status: status
            }
        });

        revalidatePath(`/patients/${record.patientId}`);
    }

    revalidatePath('/billing');
    return payment;
}

export async function recordServiceLevelPayment(itemId: string, amount: number, method: string) {
    const db = await getTenantDb();

    const item = await db.invoiceItem.findUnique({
        where: { id: itemId },
        include: { financialRecord: true }
    });

    if (!item) throw new Error('Item not found');

    const paidAmount = Number(item.paidAmount) + amount;
    const balance = Number(item.subtotal) - paidAmount;

    await db.invoiceItem.update({
        where: { id: itemId },
        data: {
            paidAmount: new Decimal(paidAmount),
            paymentStatus: balance <= 0 ? 'PAID' : 'PARTIAL'
        }
    });

    // Create a general payment record linked to the main invoice
    await recordPayment(item.financialRecordId, amount, method);

    revalidatePath(`/patients/${item.financialRecord.patientId}`);
    revalidatePath('/billing');
}
