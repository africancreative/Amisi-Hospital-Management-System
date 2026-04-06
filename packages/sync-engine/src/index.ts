export * from './journal';
export * from './purge-worker';
export * from './connectivity';
export * from './sync-engine';

import { getTenantDb } from '@amisi/database';
import { startPurgeWorker } from './purge-worker';
import { isOffline } from './connectivity';
import { runSyncLoop } from './sync-engine';

async function main() {
    const tenantId = process.env.CURRENT_TENANT_ID;
    if (!tenantId) {
        console.error("CURRENT_TENANT_ID environment variable is required.");
        process.exit(1);
    }

    console.log(`[Amisi HealthOS] Initializing edge services for Tenant ${tenantId}...`);

    // 1. Check Connectivity
    const offline = await isOffline();
    console.log(`[Amisi HealthOS] Current Status: ${offline ? 'OFFLINE' : 'ONLINE'}`);

    // 2. Start Purge Worker
    startPurgeWorker(tenantId);
    console.log(`[Amisi HealthOS] Rolling Purge Worker started (5-day retention).`);

    // 3. Start Sync Engine loop
    const db = await getTenantDb(tenantId);
    runSyncLoop(tenantId, db);
    console.log(`[Amisi HealthOS] Sync Engine activated.`);

    console.log(`[Amisi HealthOS] Services operational.`);
}

if (require.main === module) {
    main().catch(console.error);
}
