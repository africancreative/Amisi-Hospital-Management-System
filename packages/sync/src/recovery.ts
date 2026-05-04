import { TenantClient } from '@amisimedos/db';
import axios from 'axios';
import crypto from 'crypto';

const CLOUD_SYNC_URL = process.env.CLOUD_SYNC_URL || 'https://api.amisigenuine.com/api/sync';
const SYNC_SHARED_SECRET = process.env.SYNC_SHARED_SECRET!;

/**
 * Recovery Service - Cloud → Local Replication
 * 
 * Handles:
 * 1. Full Bootstrap - Initial data load for new/wiped nodes
 * 2. Incremental Sync - Catch-up from last known sequence
 * 3. Selective Recovery - Re-sync specific entity types
 * 4. Conflict Resolution - Handle data divergence
 */

export interface BootstrapResponse {
    snapshot: Record<string, any[]>;
    checkpointSequence: number;
    entityCounts: Record<string, number>;
    metadata: {
        tenantId: string;
        timestamp: string;
        version: string;
    };
}

export interface IncrementalSyncResponse {
    deltas: SyncDelta[];
    lastSequence: number;
    hasMore: boolean;
}

export interface SyncDelta {
    entityType: string;
    entityId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    payload: any;
    encryptedPayload?: string;
    timestamp: string;
    sequenceNumber: number;
    version: number;
}

/**
 * FULL BOOTSTRAP - Initial replication
 * Used when: New edge node, database wipe, corrupted state
 */
export async function initiateBootstrap(tenantId: string, edgeDb: TenantClient): Promise<BootstrapResponse> {
    console.log(`[Recovery] Initializing Full Bootstrap for Tenant: ${tenantId}`);

    try {
        const response = await axios.get<BootstrapResponse>(`${CLOUD_SYNC_URL}/bootstrap`, {
            headers: { 'x-tenant-id': tenantId, 'x-resolved-tenant-id': tenantId }
        });

        const { snapshot, checkpointSequence, entityCounts, metadata } = response.data;

        if (!snapshot) {
            console.warn('[Recovery] Cloud returned empty snapshot. Nothing to bootstrap.');
            return response.data;
        }

        console.log(`[Recovery] Received snapshot: ${Object.values(entityCounts).reduce((a, b) => a + b, 0)} total records`);

        await edgeDb.$transaction(async (tx) => {
            for (const table of Object.keys(snapshot)) {
                const records = snapshot[table];
                if (!Array.isArray(records) || records.length === 0) continue;

                console.log(`[Recovery] Loading ${records.length} into ${table}...`);
                
                const modelName = table.charAt(0).toLowerCase() + table.slice(1);
                const model = (tx as any)[modelName];
                
                if (!model) {
                    console.warn(`[Recovery] Unknown model: ${table}`);
                    continue;
                }

                for (const record of records) {
                    await model.upsert({
                        where: { id: record.id },
                        create: { ...record, isSynced: true },
                        update: { ...record, isSynced: true }
                    });
                }
            }

            // Checkpoint - prevents re-fetching full history
            await tx.eventJournal.create({
                data: {
                    entityType: 'SYSTEM',
                    entityId: 'BOOTSTRAP_COMPLETE',
                    action: 'UPDATE',
                    direction: 'INCOMING',
                    isSynced: true,
                    sequenceNumber: BigInt(checkpointSequence),
                    payload: { 
                        message: 'Full Bootstrap Complete', 
                        entityCounts,
                        version: metadata.version
                    },
                    timestamp: new Date()
                }
            });
        });

        console.log(`[Recovery] Bootstrap complete. Checkpoint: ${checkpointSequence}`);
        return response.data;

    } catch (error: any) {
        console.error('[Recovery] Bootstrap failed:', error.message);
        throw error;
    }
}

/**
 * INCREMENTAL SYNC - Catch-up replication
 * Used when: Regular sync after initial bootstrap
 */
export async function performIncrementalSync(tenantId: string, edgeDb: TenantClient): Promise<IncrementalSyncResponse> {
    const lastEvent = await edgeDb.eventJournal.findFirst({
        where: { direction: 'INCOMING' },
        orderBy: { sequenceNumber: 'desc' }
    });

    const lastSequence = lastEvent?.sequenceNumber ? Number(lastEvent.sequenceNumber) : 0;
    console.log(`[Recovery] Incremental sync from sequence: ${lastSequence}`);

    try {
        const response = await axios.get<IncrementalSyncResponse>(
            `${CLOUD_SYNC_URL}/deltas?lastSequence=${lastSequence}&limit=100`,
            {
                headers: { 'x-tenant-id': tenantId, 'x-resolved-tenant-id': tenantId }
            }
        );

        const { deltas, lastSequence: newSequence, hasMore } = response.data;

        if (deltas.length === 0) {
            return response.data;
        }

        console.log(`[Recovery] Received ${deltas.length} deltas. Sequence: ${newSequence}`);

        for (const delta of deltas) {
            await applyDelta(tenantId, edgeDb, delta);
        }

        return response.data;

    } catch (error: any) {
        console.error('[Recovery] Incremental sync failed:', error.message);
        throw error;
    }
}

/**
 * SELECTIVE RE-SYNC - Re-sync specific entity type
 * Used when: Data corruption in specific tables, manual recovery
 */
export async function performSelectiveSync(tenantId: string, edgeDb: TenantClient, entityTypes: string[]): Promise<void> {
    console.log(`[Recovery] Selective sync for: ${entityTypes.join(', ')}`);

    for (const entityType of entityTypes) {
        try {
            const response = await axios.get(
                `${CLOUD_SYNC_URL}/entities/${entityType}`,
                {
                    headers: { 'x-tenant-id': tenantId },
                    params: { limit: 500 }
                }
            );

            const records = response.data.records || [];
            const modelName = entityType.charAt(0).toLowerCase() + entityType.slice(1);
            const model = (edgeDb as any)[modelName];

            if (!model) {
                console.warn(`[Recovery] Unknown model: ${entityType}`);
                continue;
            }

            await edgeDb.$transaction(async (tx) => {
                for (const record of records) {
                    await (tx as any)[modelName].upsert({
                        where: { id: record.id },
                        create: { ...record, isSynced: true },
                        update: { ...record, isSynced: true }
                    });
                }
            });

            console.log(`[Recovery] Re-synced ${records.length} ${entityType} records`);

        } catch (error: any) {
            console.error(`[Recovery] Selective sync failed for ${entityType}:`, error.message);
        }
    }
}

/**
 * APPLY DELTA - Local application of cloud change
 */
async function applyDelta(tenantId: string, edgeDb: TenantClient, delta: SyncDelta): Promise<void> {
    const { decryptPayload } = await import('./crypto');
    
    // E2EE Decryption
    let fullPayload = { ...delta.payload };
    if (delta.encryptedPayload) {
        try {
            const sensitiveData = decryptPayload(delta.encryptedPayload, SYNC_SHARED_SECRET);
            fullPayload = { ...fullPayload, ...sensitiveData };
        } catch (err) {
            console.error(`[Recovery] Decryption failed for ${delta.entityType}:${delta.entityId}`);
            throw err;
        }
    }

    const modelName = delta.entityType.charAt(0).toLowerCase() + delta.entityType.slice(1);
    const model = (edgeDb as any)[modelName];

    if (!model) {
        console.warn(`[Recovery] Skipping unknown model: ${delta.entityType}`);
        return;
    }

    await edgeDb.$transaction(async (tx) => {
        if (delta.action === 'DELETE') {
            await (tx as any)[modelName].delete({ where: { id: delta.entityId } });
        } else {
            const existing = await (tx as any)[modelName].findUnique({ where: { id: delta.entityId } });
            
            if (existing) {
                // Version-based conflict resolution
                if (delta.version > existing.version) {
                    await (tx as any)[modelName].update({
                        where: { id: delta.entityId },
                        data: { ...fullPayload, version: delta.version, isSynced: true }
                    });
                }
            } else {
                await (tx as any)[modelName].create({
                    data: { ...fullPayload, version: delta.version, isSynced: true }
                });
            }
        }

        // Record incoming journal entry
        await tx.eventJournal.create({
            data: {
                entityType: delta.entityType,
                entityId: delta.entityId,
                action: delta.action,
                payload: delta.payload,
                encryptedPayload: delta.encryptedPayload,
                direction: 'INCOMING',
                isSynced: true,
                sequenceNumber: BigInt(delta.sequenceNumber),
                timestamp: new Date(delta.timestamp)
            }
        });
    });
}

/**
 * HEALTH CHECK - Verify replication integrity
 */
export async function verifyReplicationHealth(tenantId: string, edgeDb: TenantClient): Promise<{
    healthy: boolean;
    issues: string[];
    lastSync: Date | null;
    pendingCount: number;
}> {
    const issues: string[] = [];
    
    const lastSyncEvent = await edgeDb.eventJournal.findFirst({
        where: { direction: 'INCOMING' },
        orderBy: { timestamp: 'desc' }
    });

    const pendingCount = await edgeDb.eventJournal.count({
        where: { isSynced: false, direction: 'OUTGOING' }
    });

    const journalCount = await edgeDb.eventJournal.count();

    if (journalCount === 0) {
        issues.push('No journal entries - bootstrap needed');
    }

    if (pendingCount > 100) {
        issues.push(`High pending queue: ${pendingCount} items`);
    }

    const lastSync = lastSyncEvent?.timestamp || null;
    const hoursSinceSync = lastSync ? (Date.now() - lastSync.getTime()) / (1000 * 60 * 60) : Infinity;

    if (hoursSinceSync > 24) {
        issues.push(`No sync for ${hoursSinceSync.toFixed(1)} hours`);
    }

    return {
        healthy: issues.length === 0,
        issues,
        lastSync,
        pendingCount
    };
}

/**
 * PERIODIC SNAPSHOT RECONCILIATION (Section 4.3)
 * Compares record counts and checksums to detect missed CDC events.
 */
export async function performReconciliation(tenantId: string, edgeDb: TenantClient): Promise<{ recoveredCount: number }> {
    console.log(`[Recovery] Starting Periodic Reconciliation for ${tenantId}...`);
    let recoveredCount = 0;

    try {
        const response = await axios.get<{ checksums: Record<string, { count: number, hash: string }> }>(
            `${CLOUD_SYNC_URL}/reconcile`,
            { headers: { 'x-tenant-id': tenantId } }
        );

        const { checksums } = response.data;

        for (const [entityType, cloudStats] of Object.entries(checksums)) {
            const modelName = entityType.charAt(0).toLowerCase() + entityType.slice(1);
            const model = (edgeDb as any)[modelName];
            if (!model) continue;

            const localCount = await model.count();

            if (localCount !== cloudStats.count) {
                console.warn(`[Recovery] Drift detected in ${entityType}: Local ${localCount} vs Cloud ${cloudStats.count}`);
                // Trigger selective sync for this entity type
                await performSelectiveSync(tenantId, edgeDb, [entityType]);
                recoveredCount += Math.abs(cloudStats.count - localCount);
            }
        }

        return { recoveredCount };
    } catch (error: any) {
        console.error('[Recovery] Reconciliation failed:', error.message);
        return { recoveredCount: 0 };
    }
}
