import { TenantClient } from '@amisi/database';
import axios from 'axios';
import { isOffline } from './connectivity';
import { signEvent, encryptPayload, decryptPayload } from './cryptography';

const CLOUD_SYNC_URL = process.env.CLOUD_SYNC_URL || 'https://api.amisigenuine.com/api/sync';
const EDGE_PRIVATE_KEY = process.env.EDGE_PRIVATE_KEY!;
const SYNC_SHARED_SECRET = process.env.SYNC_SHARED_SECRET!;

/**
 * The Sync Engine handles:
 * 1. Pushing local EventJournal entries to the Cloud (Neon).
 * 2. Pulling changes from the Cloud to the Edge.
 * 3. Specialized reconciliation for different entity types.
 */
export async function runSyncLoop(tenantId: string, edgeDb: TenantClient) {
    console.log(`[SyncEngine] Initializing resilient sync loop for ${tenantId}...`);

    let retryCount = 0;
    const baseDelay = 5000; // 5 seconds

    const runCycle = async () => {
        if (await isOffline()) {
            console.log(`[SyncEngine] Edge is offline. Skipping sync cycle.`);
            setTimeout(runCycle, 30000);
            return;
        }

        // Check for suspension
        const settings = await edgeDb.hospitalSettings.findFirst();
        if (settings?.systemStatus === 'SUSPENDED') {
            console.warn(`[SyncEngine] Tenant ${tenantId} is SUSPENDED. Sync halted.`);
            setTimeout(runCycle, 60000); // Check again in 1 min
            return;
        }

        try {
            await performPushSync(tenantId, edgeDb);
            await performPullSync(tenantId, edgeDb);
            retryCount = 0; // Reset on success
            setTimeout(runCycle, 15000); // 15s interval on success
        } catch (error: any) {
            retryCount++;
            const delay = Math.min(baseDelay * Math.pow(2, retryCount), 300000); // Max 5 mins
            console.error(`[SyncEngine] Sync failed (Retry ${retryCount}). Waiting ${delay / 1000}s. Error:`, error.message);
            setTimeout(runCycle, delay);
        }
    };

    runCycle();
}

/**
 * PUSH: Edge -> Cloud
 */
async function performPushSync(tenantId: string, edgeDb: TenantClient) {
    const unsyncedEvents = await edgeDb.eventJournal.findMany({
        where: { isSynced: false },
        orderBy: { timestamp: 'asc' },
        take: 50
    });

    if (unsyncedEvents.length === 0) return;

    // Prepare batch with signatures
    const batch = unsyncedEvents.map(event => {
        const payload = event.payload;
        const message = `${event.entityType}:${event.entityId}:${event.action}:${JSON.stringify(payload)}`;
        const signature = signEvent(message, EDGE_PRIVATE_KEY);

        return {
            ...event,
            signature,
            // In a highly secure setup, we would also encrypt the payload here
            // payload: encryptPayload(payload, SYNC_SHARED_SECRET)
        };
    });

    const response = await axios.post(`${CLOUD_SYNC_URL}/push`, { batch }, {
        headers: { 'x-tenant-id': tenantId }
    });

    const { acceptedIds, conflicts } = response.data;

    // Update local status for accepted events
    if (acceptedIds.length > 0) {
        await edgeDb.eventJournal.updateMany({
            where: { id: { in: acceptedIds } },
            data: { isSynced: true }
        });

        // Also mark entity as synced
        for (const event of unsyncedEvents.filter(e => acceptedIds.includes(e.id))) {
            const model = (edgeDb as any)[event.entityType.charAt(0).toLowerCase() + event.entityType.slice(1)];
            if (model) {
                await model.update({ where: { id: event.entityId }, data: { isSynced: true } });
            }
        }
    }

    if (conflicts.length > 0) {
        console.warn(`[SyncEngine] ${conflicts.length} conflicts detected during push.`);
    }
}

/**
 * PULL: Cloud -> Edge
 */
async function performPullSync(tenantId: string, edgeDb: TenantClient) {
    const lastEvent = await edgeDb.eventJournal.findFirst({
        where: { direction: 'INCOMING' as any }, // Assuming we track direction
        orderBy: { timestamp: 'desc' }
    });

    const lastId = lastEvent?.id || '';
    const response = await axios.get(`${CLOUD_SYNC_URL}/delta?lastId=${lastId}`, {
        headers: { 'x-tenant-id': tenantId }
    });

    const { deltas } = response.data;
    if (deltas.length === 0) return;

    for (const delta of deltas) {
        // Apply remote changes locally
        // Reconciliation logic...
        try {
            const model = (edgeDb as any)[delta.entityType.charAt(0).toLowerCase() + delta.entityType.slice(1)];
            if (delta.action === 'CREATE') {
                await model.create({ data: { ...delta.payload, isSynced: true } });
            } else if (delta.action === 'UPDATE') {
                await model.update({ where: { id: delta.entityId }, data: { ...delta.payload, isSynced: true } });
            }
        } catch (e) {
            console.error(`[SyncEngine] Local apply failed for ${delta.id}`);
        }
    }
}
