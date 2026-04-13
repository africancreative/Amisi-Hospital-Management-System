import cron from 'node-cron';
import { getTenantDb } from '@amisimedos/db';
import { TenantClient as PrismaClient } from '@amisimedos/db';

/**
 * Purge worker that runs every day at midnight.
 * Enforces 5-day rolling retention.
 */
export async function startPurgeWorker(tenantId: string) {
    // Realistically, the control plane would trigger this for all active tenants.
    cron.schedule('0 0 * * *', async () => {
        console.log(`[Purge] Starting daily purge for tenant ${tenantId}`);
        const db = await getTenantDb(tenantId);
        await purgeOldData(db);
    });
}

async function purgeOldData(db: PrismaClient) {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    console.log(`[Purge] Purging data older than ${fiveDaysAgo.toISOString()}`);

    // 1. Purge Patients (General Data)
    const purgedPatients = await db.patient.deleteMany({
        where: {
            createdAt: { lt: fiveDaysAgo },
            isSynced: true // Safety: Only purge if synced to Cloud
        }
    });
    console.log(`[Purge] Removed ${purgedPatients.count} patients.`);

    // 2. Purge Financial Records (Strict Enforcement)
    const purgedInvoices = await db.invoice.deleteMany({
        where: {
            createdAt: { lt: fiveDaysAgo },
            isSynced: true
        }
    });
    console.log(`[Purge] Removed ${purgedInvoices.count} invoices.`);

    const purgedPayments = await db.payment.deleteMany({
        where: {
            createdAt: { lt: fiveDaysAgo },
            isSynced: true
        }
    });
    console.log(`[Purge] Removed ${purgedPayments.count} payments.`);

    const purgedBillItems = await db.billItem.deleteMany({
        where: {
            createdAt: { lt: fiveDaysAgo },
            isSynced: true
        }
    });
    console.log(`[Purge] Removed ${purgedBillItems.count} bill items.`);

    // 3. Purge Processed Journal Events
    const purgedJournal = await db.eventJournal.deleteMany({
        where: {
            timestamp: { lt: fiveDaysAgo },
            isSynced: true
        }
    });
    console.log(`[Purge] Cleaned ${purgedJournal.count} journal entries.`);
}

// Manual trigger for testing
if (require.main === module) {
    const tenantId = process.argv[2];
    if (!tenantId) {
        console.error("Usage: ts-node purge-worker.ts <TenantId>");
        process.exit(1);
    }
    getTenantDb(tenantId).then(db => purgeOldData(db));
}
