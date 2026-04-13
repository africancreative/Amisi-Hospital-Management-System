import { TenantClient } from '@amisimedos/db';
import axios from 'axios';

const CLOUD_SYNC_URL = process.env.CLOUD_SYNC_URL || 'https://api.amisigenuine.com/api/sync';

/**
 * Recovery Service
 * 
 * Handles the "Bootstrap" flow for new or wiped Edge nodes.
 * Downloads a complete snapshot of clinical state from the Cloud Hub.
 */
export async function initiateBootstrap(tenantId: string, edgeDb: TenantClient) {
    console.log(`[Recovery] Initializing Full Bootstrap for Tenant: ${tenantId}`);

    try {
        // 1. Request Bootstrap Snapshot from Cloud
        const response = await axios.get(`${CLOUD_SYNC_URL}/bootstrap`, {
            headers: { 'x-tenant-id': tenantId, 'x-resolved-tenant-id': tenantId }
        });

        const { snapshot, checkpointSequence } = response.data;

        if (!snapshot) {
            console.warn('[Recovery] Cloud returned an empty snapshot. Nothing to bootstrap.');
            return;
        }

        // 2. Perform Bulk Load in a massive transaction
        // NOTE: We use raw inserts or bulk creation for clinical entities
        await edgeDb.$transaction(async (tx) => {
            for (const table of Object.keys(snapshot)) {
                const records = snapshot[table];
                if (!Array.isArray(records)) continue;

                console.log(`[Recovery] Loading ${records.length} records into ${table}...`);
                
                const model = (tx as any)[table.charAt(0).toLowerCase() + table.slice(1)];
                if (!model) {
                    console.warn(`[Recovery] Snapshot contains unknown model: ${table}`);
                    continue;
                }

                for (const record of records) {
                    // Upsert to ensure we don't crash on existing data
                    await model.upsert({
                        where: { id: record.id },
                        create: { ...record, isSynced: true },
                        update: { ...record, isSynced: true }
                    });
                }
            }

            // 3. Set the Journal Checkpoint
            // This prevents the Edge from re-pulling the entire history
            await tx.eventJournal.create({
                data: {
                    entityType: 'SYSTEM',
                    entityId: 'BOOTSTRAP',
                    action: 'UPDATE',
                    direction: 'INCOMING',
                    isSynced: true,
                    sequenceNumber: BigInt(checkpointSequence),
                    payload: { message: 'Full Bootstrap Complete' },
                    timestamp: new Date()
                }
            });
        });

        console.log(`[Recovery] Bootstrap Success. Synced to Seq: ${checkpointSequence}`);
    } catch (error: any) {
        console.error('[Recovery] Bootstrap Failed:', error.message);
        throw error;
    }
}
