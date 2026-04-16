export * from './journal';
export * from './purge-worker';
export * from './connectivity';
export * from './connectivity-auto';
export * from './sync-engine';
export * from './offline-fallback';
export * from './recovery';
export * from './routing';

import { getTenantDb } from '@amisimedos/db';
import { startPurgeWorker } from './purge-worker';
import { isOffline } from './connectivity';
import { runSyncLoop } from './sync-engine';

async function main() {
    const tenantId = process.env.CURRENT_TENANT_ID;
    if (!tenantId) {
        console.error("CURRENT_TENANT_ID environment variable is required.");
        process.exit(1);
    }

    console.log(`[AmisiMedOS] Initializing edge services for Tenant ${tenantId}...`);

    // 1. Check Connectivity
    const offline = await isOffline();
    console.log(`[AmisiMedOS] Current Status: ${offline ? 'OFFLINE' : 'ONLINE'}`);

    // 2. Start Purge Worker
    startPurgeWorker(tenantId);
    console.log(`[AmisiMedOS] Rolling Purge Worker started (5-day retention).`);

    // 3. Start Sync Engine loop
    const db = await getTenantDb(tenantId);
    runSyncLoop(tenantId, db);
    console.log(`[AmisiMedOS] Sync Engine activated.`);

    console.log(`[AmisiMedOS] Services operational.`);
}

if (require.main === module) {
    main().catch(console.error);
}
