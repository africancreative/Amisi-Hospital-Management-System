'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole } from '@/lib/auth-utils';
import { Decimal } from '@amisimedos/db/client';

export type JournalLineInput = {
    accountId: string;
    description?: string;
    debit: number;
    credit: number;
};

/**
 * Core Accounting Posting Service
 * Enforces IFRS Double-Entry constraints: Sum(Debits) must equal Sum(Credits)
 */
export async function postJournalEntry(data: {
    description: string;
    date: Date;
    reference?: string;
    sourceType?: string;
    sourceId?: string;
    lines: JournalLineInput[];
}): Promise<any> {
    await ensureRole(['ACCOUNTANT', 'ADMIN']);
    const db = await getTenantDb();

    // 1. Validate Debit/Credit balance
    const totalDebits = data.lines.reduce((acc: any, line: any) => acc + line.debit, 0);
    const totalCredits = data.lines.reduce((acc: any, line: any) => acc + line.credit, 0);

    const difference = Math.abs(totalDebits - totalCredits);
    if (difference > 0.001) { // Floating point tolerance
        throw new Error(`Unbalanced Journal Entry: Debits (${totalDebits}) != Credits (${totalCredits})`);
    }

    // 2. Perform atomic posting
    const entry = await db.$transaction(async (tx) => {
        const je = await tx.journalEntry.create({
            data: {
                description: data.description,
                date: data.date,
                reference: data.reference,
                sourceType: data.sourceType,
                sourceId: data.sourceId,
                status: 'POSTED',
                lines: {
                    create: data.lines.map((line: any) => ({
                        accountId: line.accountId,
                        description: line.description,
                        debit: new Decimal(line.debit),
                        credit: new Decimal(line.credit)
                    }))
                }
            },
            include: { lines: true }
        });

        // Update Account versions for sync tracking (if needed)
        for (const line of data.lines) {
            await tx.account.update({
                where: { id: line.accountId },
                data: { version: { increment: 1 } }
            });
        }

        return je;
    });

    revalidatePath('/accounting');
    return entry;
}

export async function getAccounts(): Promise<any> {
    const db = await getTenantDb();
    return db.account.findMany({
        orderBy: { code: 'asc' }
    });
}

export async function createAccount(data: { code: string, name: string, type: string, description?: string }): Promise<any> {
    await ensureRole(['ACCOUNTANT', 'ADMIN']);
    const db = await getTenantDb();
    const account = await db.account.create({
        data
    });
    revalidatePath('/accounting/coa');
    return account;
}

export async function getTrialBalance(): Promise<any> {
    await ensureRole(['ACCOUNTANT', 'ADMIN']);
    const db = await getTenantDb();
    const accounts = await db.account.findMany({
        include: {
            journalLines: true
        }
    });

    return accounts.map((acc: any) => {
        const totalDebit = acc.journalLines.reduce((sum: any, l: any) => sum + Number(l.debit), 0);
        const totalCredit = acc.journalLines.reduce((sum: any, l: any) => sum + Number(l.credit), 0);

        // Net balance calculation based on account type
        let balance = 0;
        if (['ASSET', 'EXPENSE'].includes(acc.type)) {
            balance = totalDebit - totalCredit;
        } else {
            balance = totalCredit - totalDebit;
        }

        return {
            ...acc,
            totalDebit,
            totalCredit,
            balance
        };
    });
}

export async function getRecentJournalEntries(): Promise<any> {
    await ensureRole(['ACCOUNTANT', 'ADMIN']);
    const db = await getTenantDb();
    return db.journalEntry.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
            lines: {
                include: { account: true }
            }
        }
    });
}

/**
 * Helper to resolve standard account codes for automation
 */
export async function getStandardAccount(code: string, name: string, type: string): Promise<any> {
    const db = await getTenantDb();
    let account = await db.account.findUnique({ where: { code } });
    if (!account) {
        account = await db.account.create({
            data: { code, name, type, description: `Automated ${name} Account` }
        });
    }
    return account;
}
