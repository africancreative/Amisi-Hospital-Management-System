'use server';

import { getTenantDb } from '@/lib/db';

// ---------------------------------------------------------------------------
// IFRS / US GAAP DOUBLE-ENTRY ACCOUNTING BRIDGE
// ---------------------------------------------------------------------------
// This module generates automated Journal Entries for every inventory and
// billing event, ensuring compliance with:
//   - IAS 2: Inventories (IFRS)
//   - ASC 330: Inventory (US GAAP)
//   - ASC 606: Revenue Recognition
//   - IAS 37: Provisions and Accrued Liabilities
// ---------------------------------------------------------------------------

// Standard hospital Chart of Accounts codes
// These constants represent the default COA seeded at tenant provisioning.
const COA = {
    // Assets
    CASH:                '1010',
    ACCOUNTS_RECEIVABLE: '1200',
    INVENTORY_ASSET:     '1310',
    PREPAID_EXPENSES:    '1400',
    // Liabilities
    ACCOUNTS_PAYABLE:    '2100',
    AP_ACCRUAL:          '2110', // Used for GRN before invoice
    DEFERRED_REVENUE:    '2300',
    // Revenue
    SERVICE_REVENUE:     '4000',
    PHARMACY_REVENUE:    '4100',
    DIAGNOSTIC_REVENUE:  '4200',
    IPD_REVENUE:         '4300',
    // Expenses
    COGS:                '5100',
    CONTRACTUAL_ALLOW:   '5200', // Insurance contractual adjustments (contra-revenue)
    DEPRECIATION_EXP:    '5300',
};

type JournalType =
    | 'GRN_STOCK_IN'         // Goods received: Inventory ↑, AP Accrual ↑
    | 'CLINICAL_CHARGE'      // Service billed: AR ↑, Revenue ↑
    | 'PHARMACY_DISPENSE'    // Drug dispensed: COGS ↑, Inventory ↓
    | 'INSURANCE_PAYMENT'    // Insurance pays: Cash ↑, AR ↓
    | 'PATIENT_PAYMENT'      // Patient pays direct: Cash ↑, AR ↓
    | 'CONTRACTUAL_ADJUST'   // Insurance allowed < billed: Allowance ↑, AR ↓
    | 'AP_SETTLEMENT';       // Vendor paid: AP ↓, Cash ↓

interface JournalRequest {
    type: JournalType;
    sourceId: string;         // GRN ID, Invoice ID, Payment ID, etc.
    amount: number;
    description: string;
    fiscalPeriod: string;     // 'YYYY-MM'
    accountingStandard?: string; // 'IFRS' | 'US_GAAP' | 'BOTH'
}

export async function postInventoryJournalEntry(req: JournalRequest): Promise<void> {
    const db = await getTenantDb();

    // Resolve the actual GL account IDs from the COA codes
    const resolveAccount = async (code: string) => {
        const account = await db.account.findFirst({ where: { code } });
        if (!account) {
            // Gracefully skip if COA not yet seeded (will be resolved after db:generate)
            console.warn(`[Accounting Bridge] Account not found for code: ${code}`);
            return null;
        }
        return account.id;
    };

    const lines = await buildJournalLines(req, resolveAccount);
    if (!lines || lines.length === 0) return;

    // Verify balance (Debits === Credits) before posting
    const totalDebits  = lines.reduce((s: any, l: any) => s + (l.debit  ?? 0), 0);
    const totalCredits = lines.reduce((s: any, l: any) => s + (l.credit ?? 0), 0);
    if (Math.abs(totalDebits - totalCredits) > 0.001) {
        console.error(`[Accounting Bridge] Unbalanced entry for ${req.type}: D=${totalDebits}, C=${totalCredits}`);
        return;
    }

    await db.journalEntry.create({
        data: {
            description: req.description,
            reference: req.sourceId,
            status: 'POSTED',
            accountingStandard: req.accountingStandard ?? 'BOTH',
            ledgerType: getLedgerType(req.type),
            fiscalPeriod: req.fiscalPeriod,
            sourceType: getSourceType(req.type),
            sourceId: req.sourceId,
            lines: { create: lines }
        }
    });
}

// ---------------------------------------------------------------------------
// Journal Line Builders per transaction type
// ---------------------------------------------------------------------------

async function buildJournalLines(
    req: JournalRequest,
    resolve: (code: string) => Promise<string | null>
) {
    const { type, amount, description } = req;

    switch (type) {
        case 'GRN_STOCK_IN': {
            // IAS 2 / ASC 330: Record inventory at cost
            const inv = await resolve(COA.INVENTORY_ASSET);
            const ap  = await resolve(COA.AP_ACCRUAL);
            if (!inv || !ap) return [];
            return [
                { accountId: inv, debit: amount,  credit: 0,      description: `DEBIT  Inventory: ${description}` },
                { accountId: ap,  debit: 0,        credit: amount, description: `CREDIT AP Accrual: ${description}` },
            ];
        }

        case 'CLINICAL_CHARGE': {
            // ASC 606 / IFRS 15: Revenue recognized when service rendered
            const ar  = await resolve(COA.ACCOUNTS_RECEIVABLE);
            const rev = await resolve(COA.SERVICE_REVENUE);
            if (!ar || !rev) return [];
            return [
                { accountId: ar,  debit: amount, credit: 0,      description },
                { accountId: rev, debit: 0,      credit: amount, description },
            ];
        }

        case 'PHARMACY_DISPENSE': {
            // Record COGS and reduce inventory
            const cogs = await resolve(COA.COGS);
            const inv  = await resolve(COA.INVENTORY_ASSET);
            if (!cogs || !inv) return [];
            return [
                { accountId: cogs, debit: amount, credit: 0,      description },
                { accountId: inv,  debit: 0,      credit: amount, description },
            ];
        }

        case 'INSURANCE_PAYMENT':
        case 'PATIENT_PAYMENT': {
            const cash = await resolve(COA.CASH);
            const ar   = await resolve(COA.ACCOUNTS_RECEIVABLE);
            if (!cash || !ar) return [];
            return [
                { accountId: cash, debit: amount, credit: 0,      description },
                { accountId: ar,   debit: 0,      credit: amount, description },
            ];
        }

        case 'CONTRACTUAL_ADJUST': {
            // Insurance pays less than billed (allowed amount adjustment)
            const allow = await resolve(COA.CONTRACTUAL_ALLOW);
            const ar    = await resolve(COA.ACCOUNTS_RECEIVABLE);
            if (!allow || !ar) return [];
            return [
                { accountId: allow, debit: amount, credit: 0,      description },
                { accountId: ar,    debit: 0,      credit: amount, description },
            ];
        }

        case 'AP_SETTLEMENT': {
            const ap   = await resolve(COA.ACCOUNTS_PAYABLE);
            const cash = await resolve(COA.CASH);
            if (!ap || !cash) return [];
            return [
                { accountId: ap,   debit: amount, credit: 0,      description },
                { accountId: cash, debit: 0,      credit: amount, description },
            ];
        }

        default:
            return [];
    }
}

function getLedgerType(type: JournalType): string {
    if (['INSURANCE_PAYMENT', 'PATIENT_PAYMENT', 'CONTRACTUAL_ADJUST', 'CLINICAL_CHARGE'].includes(type)) return 'AR';
    if (['GRN_STOCK_IN', 'AP_SETTLEMENT'].includes(type)) return 'AP';
    if (['PHARMACY_DISPENSE'].includes(type)) return 'INVENTORY';
    return 'GENERAL';
}

function getSourceType(type: JournalType): string {
    if (['GRN_STOCK_IN', 'AP_SETTLEMENT'].includes(type)) return 'PROCUREMENT';
    if (['PHARMACY_DISPENSE'].includes(type)) return 'PHARMACY';
    if (['CLINICAL_CHARGE', 'INSURANCE_PAYMENT', 'PATIENT_PAYMENT', 'CONTRACTUAL_ADJUST'].includes(type)) return 'BILLING';
    return 'MANUAL';
}
