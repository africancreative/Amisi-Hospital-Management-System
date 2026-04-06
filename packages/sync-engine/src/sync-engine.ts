import { TenantClient } from '@amisi/database';
import axios from 'axios';
import { isOffline } from './connectivity';
import { resolveSemanticConflict } from './resolver';
import crypto from 'crypto';

const CLOUD_SYNC_URL = process.env.CLOUD_SYNC_URL || 'https://api.amisigenuine.com/api/sync';
const SYNC_SHARED_SECRET = process.env.SYNC_SHARED_SECRET!;

/**
 * The Sync Engine handles:
 * 1. Pushing local EventJournal entries to the Cloud.
 * 2. Pulling changes from the Cloud to the Edge.
 * 3. Update SyncNode Heartbeat for observability.
 */
export async function runSyncLoop(tenantId: string, edgeDb: TenantClient) {
    console.log(`[Sync Engine] Initializing for ${tenantId}...`);

    const runCycle = async () => {
        if (await isOffline()) {
            setTimeout(runCycle, 30000);
            return;
        }

        try {
            // 1. Heartbeat
            await edgeDb.syncNode.upsert({
                where: { id: 'local-edge-node' },
                update: { lastHeartbeat: new Date(), status: 'HEALTHY' },
                create: { id: 'local-edge-node', nodeName: 'Primary Edge Node', nodeType: 'EDGE', version: '4.0.0' }
            });

            // 2. Sync Logic
            await performPushSync(tenantId, edgeDb);
            await performPullSync(tenantId, edgeDb);

            setTimeout(runCycle, 15000); // 15s interval
        } catch (error: any) {
            console.error(`[Sync Engine] Cycle failed: ${error.message}`);
            setTimeout(runCycle, 60000); // Backoff on error
        }
    };

    runCycle();
}

/**
 * PUSH: Edge -> Cloud
 */
async function performPushSync(tenantId: string, edgeDb: TenantClient) {
    const unsyncedEvents = await edgeDb.eventJournal.findMany({
        where: { isSynced: false, direction: 'OUTGOING' },
        orderBy: { timestamp: 'asc' },
        take: 50
    });

    if (unsyncedEvents.length === 0) return;

    const batch = unsyncedEvents.map(event => {
        const payloadString = JSON.stringify(event.payload);
        const message = `${event.entityType}:${event.entityId}:${event.action}:${payloadString}`;
        const signature = crypto
            .createHmac('sha256', SYNC_SHARED_SECRET)
            .update(message)
            .digest('hex');

        return { ...event, signature };
    });

    const response = await axios.post(`${CLOUD_SYNC_URL}`, { batch }, {
        headers: { 'x-tenant-id': tenantId, 'x-resolved-tenant-id': tenantId }
    });

    const { acceptedIds } = response.data;

    if (acceptedIds.length > 0) {
        await edgeDb.eventJournal.updateMany({
            where: { id: { in: acceptedIds } },
            data: { isSynced: true }
        });
    }
}

/**
 * PULL: Cloud -> Edge
 */
async function performPullSync(tenantId: string, edgeDb: TenantClient) {
    // Determine last known sequence from Cloud
    const lastEvent = await edgeDb.eventJournal.findFirst({
        where: { direction: 'INCOMING' },
        orderBy: { sequenceNumber: 'desc' }
    });

    const lastSequence = lastEvent?.sequenceNumber?.toString() || '0';
    const response = await axios.get(`${CLOUD_SYNC_URL}?lastSequence=${lastSequence}`, {
        headers: { 'x-tenant-id': tenantId, 'x-resolved-tenant-id': tenantId }
    });

    const { deltas } = response.data;
    if (!deltas || deltas.length === 0) return;

    for (const delta of deltas) {
        const modelName = delta.entityType.charAt(0).toLowerCase() + delta.entityType.slice(1);
        const model = (edgeDb as any)[modelName];
        
        if (!model) continue;

        const existing = await model.findUnique({ where: { id: delta.entityId } });

        if (existing) {
            // Resolve conflict with the incoming Cloud change
            const resolvedData = resolveSemanticConflict(
                { id: existing.id, version: existing.version, data: existing, timestamp: existing.updatedAt },
                { id: delta.entityId, version: delta.payload.version, data: delta.payload, timestamp: new Date(delta.timestamp) }
            );

            await model.update({
                where: { id: delta.entityId },
                data: { ...resolvedData, isSynced: true }
            });
        } else {
            // Apply new record from Cloud
            await model.create({
                data: { ...delta.payload, isSynced: true }
            });
        }

        // Record incoming journal entry locally to track sequence
        await edgeDb.eventJournal.create({
            data: {
                ...delta,
                id: crypto.randomUUID(), // New local ID for the journal entry
                sequenceNumber: BigInt(delta.sequenceNumber),
                isSynced: true,
                direction: 'INCOMING'
            }
        });
    }
}
