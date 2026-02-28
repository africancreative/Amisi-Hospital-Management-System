'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

import { getStandardAccount, postJournalEntry } from './accounting-actions';

// Employee Actions
export async function getEmployees() {
    const db = await getTenantDb();
    return db.employee.findMany({
        orderBy: { lastName: 'asc' }
    });
}

export async function createEmployee(data: { employeeId: string, firstName: string, lastName: string, role: string, department: string, email: string, baseSalary: number }) {
    const db = await getTenantDb();
    const employee = await db.employee.create({
        data: {
            ...data,
            baseSalary: data.baseSalary
        }
    });

    revalidatePath('/hr');
    return employee;
}

// Payroll Actions
export async function generatePayroll(month: number, year: number) {
    const db = await getTenantDb();
    const employees = await db.employee.findMany({ where: { status: 'active' } });

    const records = [];
    for (const emp of employees) {
        // Basic payroll logic
        const baseAmount = Number(emp.baseSalary);
        const record = await db.payrollRecord.create({
            data: {
                employeeId: emp.id,
                periodMonth: month,
                periodYear: year,
                baseAmount: baseAmount,
                netAmount: baseAmount, // For MVP, net = base
                status: 'draft'
            }
        });
        records.push(record);
    }

    revalidatePath('/hr/payroll');
    return records;
}

export async function getPayrollHistory(month?: number, year?: number) {
    const db = await getTenantDb();
    return db.payrollRecord.findMany({
        where: {
            ...(month && { periodMonth: month }),
            ...(year && { periodYear: year })
        },
        include: { employee: true },
        orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }]
    });
}

export async function processPayment(payrollId: string) {
    const db = await getTenantDb();

    const currentRecord = await db.payrollRecord.findUnique({
        where: { id: payrollId },
        include: { employee: true }
    });

    if (!currentRecord) throw new Error("Payroll record not found");

    const record = await db.payrollRecord.update({
        where: { id: payrollId },
        data: {
            status: 'paid',
            paidAt: new Date(),
            version: { increment: 1 }
        }
    });

    // Automated Accounting Posting:
    // Debit: Salary & Wage Expense (5000)
    // Credit: Cash & Bank (1010)
    const expenseAccount = await getStandardAccount('5000', 'Salary & Wage Expense', 'EXPENSE');
    const cashAccount = await getStandardAccount('1010', 'Cash & Bank', 'ASSET');

    await postJournalEntry({
        description: `Payroll Payment for ${currentRecord.employee.firstName} ${currentRecord.employee.lastName} (${currentRecord.periodMonth}/${currentRecord.periodYear})`,
        date: new Date(),
        reference: record.id,
        sourceType: 'PAYROLL',
        sourceId: record.id,
        lines: [
            { accountId: expenseAccount.id, debit: Number(record.netAmount), credit: 0, description: 'Payroll payment execution' },
            { accountId: cashAccount.id, debit: 0, credit: Number(record.netAmount), description: 'Clearing salary liability' }
        ]
    });

    revalidatePath('/hr/payroll');
    return record;
}
