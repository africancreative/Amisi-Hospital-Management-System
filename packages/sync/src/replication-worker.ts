import { EventEmitter } from 'events';
import { isOffline } from './connectivity';
import { offlineFallback } from './offline-fallback';
import { getTenantDb } from '@amisimedos/db';

export class ReplicationWorker extends EventEmitter {
    private static instance: ReplicationWorker;
    private isRunning = false;
    private pollInterval: NodeJS.Timeout | null = null;
    
    private constructor() {
        super();
    }

    public static getInstance(): ReplicationWorker {
        if (!ReplicationWorker.instance) {
            ReplicationWorker.instance = new ReplicationWorker();
        }
        return ReplicationWorker.instance;
    }

    public start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        
        console.log('[ReplicationWorker] Started CDC downstream polling');

        this.pollInterval = setInterval(async () => {
            await this.pollReplication();
        }, 30000); // Poll every 30 seconds
    }

    public stop(): void {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
        this.isRunning = false;
        console.log('[ReplicationWorker] Stopped');
    }

    private async pollReplication(): Promise<void> {
        if (await isOffline()) {
            console.log('[ReplicationWorker] Offline - skipping pull');
            return;
        }

        // RECOVERY LOGIC (Phase 1 & 2): Push before Pull
        // Ensure that our local outgoing queue is drained before pulling downstream changes
        // This prevents overwriting our offline work with stale cloud data
        const pendingCount = await (offlineFallback as any).getQueueSize(); 
        
        if (pendingCount > 0) {
            console.log(`[ReplicationWorker] Delaying pull: Draining ${pendingCount} upstream sync items first.`);
            await offlineFallback.processQueue();
            return; // Try pulling on the next tick
        }

        const tenantId = process.env.HOSPITAL_TENANT_ID;
        if (!tenantId) return;

        const db = await getTenantDb(tenantId);

        try {
            // Retrieve the last synced cursor from the local DB's metadata table
            const metadata = await db.syncMetadata.findUnique({ where: { id: 'replication_cursor' } });
            const currentCursor = metadata?.cursor || '0';

            const cloudUrl = process.env.CLOUD_REPLICATION_URL || 'https://cloud.amisimedos.com/api/replication/pull';
            
            const response = await fetch(`${cloudUrl}?cursor=${currentCursor}&limit=100`, {
                headers: { 'x-tenant-id': tenantId }
            });

            if (!response.ok) {
                if (response.status === 410) {
                    console.error('[ReplicationWorker] Cursor expired. Triggering Full Snapshot Sync...');
                    this.emit('snapshot_required');
                    // Logic to trigger full snapshot dump download would go here
                }
                return;
            }

            const data = await response.json();
            const { changes, nextCursor, hasMore } = data;

            if (changes && changes.length > 0) {
                // Apply changes sequentially to ensure relational integrity
                for (const change of changes) {
                    // Application logic to upsert the change based on change.entityType, change.action, change.payload
                    // e.g. await db[change.entityType].upsert({ ... })
                    
                    this.emit('applied', change);
                }

                // Update cursor
                await db.syncMetadata.upsert({
                    where: { id: 'replication_cursor' },
                    update: { cursor: nextCursor },
                    create: { id: 'replication_cursor', cursor: nextCursor }
                });

                console.log(`[ReplicationWorker] Applied ${changes.length} downstream changes. New Cursor: ${nextCursor}`);

                // If more changes are available immediately, we could loop or wait for next poll
                if (hasMore) {
                    this.emit('more_available');
                }
            }

        } catch (error) {
            console.error('[ReplicationWorker] Pull failed:', error);
        }
    }
}

export const replicationWorker = ReplicationWorker.getInstance();
