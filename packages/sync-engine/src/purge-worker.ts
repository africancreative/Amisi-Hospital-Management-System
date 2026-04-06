import cron from 'node-cron';
import { getTenantDb, type TenantClient } from '@amisi/database';

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

async function purgeOldData(db: TenantClient) {
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
    const purgedFinancials = await db.financialRecord.deleteMany({
        where: {
            createdAt: { lt: fiveDaysAgo },
            isSynced: true // CRITICAL: Financial data MUST be synced before purging
        }
    });
    console.log(`[Purge] Removed ${purgedFinancials.count} financial records.`);

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
