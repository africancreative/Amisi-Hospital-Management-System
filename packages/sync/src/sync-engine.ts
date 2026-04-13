import { TenantClient } from '@amisimedos/db';
import axios from 'axios';
import { isOffline } from './connectivity';
import { resolveSemanticConflict } from './resolver';
import crypto from 'crypto';
import { SyncBackoff } from './backoff';

const CLOUD_SYNC_URL = process.env.CLOUD_SYNC_URL || 'https://api.amisigenuine.com/api/sync';
const SYNC_SHARED_SECRET = process.env.SYNC_SHARED_SECRET!;

import { initiateBootstrap } from './recovery';
import { decryptPayload } from './crypto';

/**
 * The Sync Engine handles:
 * 1. Pushing local EventJournal entries to the Cloud.
 * 2. Pulling changes from the Cloud to the Edge.
 * 3. Update SyncNode Heartbeat for observability.
 */
export async function runSyncLoop(tenantId: string, edgeDb: TenantClient) {
    console.log(`[Sync Engine] Initializing for ${tenantId}...`);
    const backoff = new SyncBackoff();

    const runCycle = async () => {
        if (await isOffline()) {
            console.log(`[Sync Engine] Offline. Retrying in 30s...`);
            setTimeout(runCycle, 30000);
            return;
        }

        try {
            // 0. Bootstrap Check
            const journalCount = await edgeDb.eventJournal.count();
            if (journalCount === 0) {
              console.log('[Sync Engine] Empty local journal detected. Initiating Bootstrap...');
              await initiateBootstrap(tenantId, edgeDb);
            }

            // 1. Heartbeat
            await edgeDb.syncNode.upsert({
                where: { id: 'local-edge-node' },
                update: { lastHeartbeat: new Date(), status: 'HEALTHY' },
                create: { id: 'local-edge-node', nodeName: 'Primary Edge Node', nodeType: 'EDGE', version: '4.0.0' }
            });

            // 2. Sync Logic
            const pushedCount = await performPushSync(tenantId, edgeDb);
            const pulledCount = await performPullSync(tenantId, edgeDb);

            if (pushedCount > 0 || pulledCount > 0) {
                console.log(`[Sync Engine] Cycle complete: ${pushedCount} pushed, ${pulledCount} pulled.`);
            }

            backoff.reset(); // Success - reset backoff
            setTimeout(runCycle, 10000); // 10s interval on success
        } catch (error: any) {
            const delay = backoff.getNextDelay();
            console.error(`[Sync Engine] Cycle failed (Attempt ${backoff.count}): ${error.message}. Retrying in ${Math.round(delay/1000)}s`);
            setTimeout(runCycle, delay);
        }
    };

    runCycle();
}


/**
 * PUSH: Edge -> Cloud
 */
async function performPushSync(tenantId: string, edgeDb: TenantClient): Promise<number> {
    const unsyncedEvents = await edgeDb.eventJournal.findMany({
        where: { isSynced: false, direction: 'OUTGOING' },
        orderBy: { timestamp: 'asc' },
        take: 50
    });

    if (unsyncedEvents.length === 0) return 0;

    const batch = unsyncedEvents.map(event => {
        // Signatures are now partially pre-calculated by the CDC extension,
        // but we verify/re-sign here to ensure batch integrity
        const payloadString = JSON.stringify(event.payload);
        const message = `${event.entityType}:${event.entityId}:${event.action}:${payloadString}`;
        const signature = crypto
            .createHmac('sha256', SYNC_SHARED_SECRET)
            .update(message)
            .digest('hex');

        return { ...event, signature };
    });

    try {
        const response = await axios.post(`${CLOUD_SYNC_URL}`, { batch }, {
            headers: { 'x-tenant-id': tenantId, 'x-resolved-tenant-id': tenantId }
        });

        const { acceptedIds } = response.data;

        if (acceptedIds && acceptedIds.length > 0) {
            await edgeDb.eventJournal.updateMany({
                where: { id: { in: acceptedIds } },
                data: { isSynced: true }
            });
            return acceptedIds.length;
        }
    } catch (pushErr: any) {
        console.warn(`[Sync Push] Batch failed: ${pushErr.response?.data?.error || pushErr.message}`);
        throw pushErr; // Propagate to trigger backoff
    }

    return 0;
}


/**
 * PULL: Cloud -> Edge
 */
async function performPullSync(tenantId: string, edgeDb: TenantClient): Promise<number> {
    // 1. Determine last known sequence from incoming Cloud events
    const lastEvent = await edgeDb.eventJournal.findFirst({
        where: { direction: 'INCOMING' },
        orderBy: { sequenceNumber: 'desc' }
    });

    const lastSequence = lastEvent?.sequenceNumber?.toString() || '0';
    
    try {
        const response = await axios.get(`${CLOUD_SYNC_URL}?lastSequence=${lastSequence}`, {
            headers: { 'x-tenant-id': tenantId, 'x-resolved-tenant-id': tenantId }
        });

        const { deltas } = response.data;
        if (!deltas || deltas.length === 0) return 0;

        let processedCount = 0;
        for (const delta of deltas) {
            const modelName = delta.entityType.charAt(0).toLowerCase() + delta.entityType.slice(1);
            const model = (edgeDb as any)[modelName];
            
            if (!model) {
                console.warn(`[Sync Pull] Skipping unknown model: ${delta.entityType}`);
                continue;
            }

            // We wrap each delta in a transaction to ensure journal + data consistency
            await edgeDb.$transaction(async (tx) => {
                // E2EE Decryption: Reconstruct the full payload from searchable and encrypted parts
                let fullPayload = { ...delta.payload };
                if (delta.encryptedPayload) {
                    try {
                        const sensitiveData = decryptPayload(delta.encryptedPayload, SYNC_SHARED_SECRET);
                        fullPayload = { ...fullPayload, ...sensitiveData };
                    } catch (decErr: any) {
                        console.error(`[Sync E2EE] Decryption failed for ${delta.entityType}:${delta.entityId}:`, decErr.message);
                        // We still try to proceed with metadata alone, or fail the transaction
                        throw decErr; 
                    }
                }

                const existing = await (tx as any)[modelName].findUnique({ where: { id: delta.entityId } });

                if (existing) {
                    const resolvedData = resolveSemanticConflict(
                        { id: existing.id, version: existing.version, data: existing, timestamp: existing.updatedAt },
                        { id: delta.entityId, version: fullPayload.version, data: fullPayload, timestamp: new Date(delta.timestamp) }
                    );

                    await (tx as any)[modelName].update({
                        where: { id: delta.entityId },
                        data: { ...resolvedData, isSynced: true }
                    });
                } else {
                    await (tx as any)[modelName].create({
                        data: { ...fullPayload, isSynced: true }
                    });
                }


                // Record the incoming sequence number to prevent redundant pulls
                await tx.eventJournal.create({
                    data: {
                        ...delta,
                        id: crypto.randomUUID(), // New local ID for the journal entry
                        sequenceNumber: BigInt(delta.sequenceNumber),
                        isSynced: true,
                        direction: 'INCOMING'
                    }
                });
            });

            processedCount++;
        }

        return processedCount;
    } catch (pullErr: any) {
        console.warn(`[Sync Pull] Batch failed: ${pullErr.message}`);
        throw pullErr;
    }
}

