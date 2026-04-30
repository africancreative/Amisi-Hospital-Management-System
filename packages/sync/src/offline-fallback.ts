import { EventEmitter } from 'events';
import { isOffline } from './connectivity';
import crypto from 'crypto';
import { getTenantDb } from '@amisimedos/db';

export interface SyncQueueRecord {
    id: string;
    entityType: string;
    entityId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    payload: any;
    status: 'PENDING' | 'SYNCING' | 'FAILED' | 'COMPLETED';
    retryCount: number;
    lastError?: string;
    timestamp: Date;
    updatedAt: Date;
}

class PersistentOfflineFallback extends EventEmitter {
    private static instance: PersistentOfflineFallback;
    private isProcessing = false;
    private isOnline = true;
    private checkInterval: NodeJS.Timeout | null = null;
    private maxRetries = 10;
    private baseRetryDelay = 2000;

    private constructor() {
        super();
    }

    public static getInstance(): PersistentOfflineFallback {
        if (!PersistentOfflineFallback.instance) {
            PersistentOfflineFallback.instance = new PersistentOfflineFallback();
        }
        return PersistentOfflineFallback.instance;
    }

    public async initialize(): Promise<void> {
        this.isOnline = !(await isOffline());
        console.log(`[SyncEngine] Initialized. Online: ${this.isOnline}`);
        
        this.checkInterval = setInterval(async () => {
            const wasOnline = this.isOnline;
            this.isOnline = !(await isOffline());
            
            if (!wasOnline && this.isOnline) {
                console.log('[SyncEngine] Connection restored. Processing persistent queue...');
                this.emit('online');
                await this.processQueue();
            } else if (wasOnline && !this.isOnline) {
                console.log('[SyncEngine] Connection lost. Operating in offline mode.');
                this.emit('offline');
            }
        }, 15000); // Check every 15 seconds
    }

    public async enqueue(tenantId: string, entityType: string, entityId: string, action: 'CREATE' | 'UPDATE' | 'DELETE', payload: any): Promise<string> {
        const db = await getTenantDb(tenantId);
        const item = await db.localSyncQueue.create({
            data: {
                entityType,
                entityId,
                action,
                payload,
                status: 'PENDING',
                retryCount: 0
            }
        });
        
        this.emit('queued', item);
        console.log(`[SyncEngine] Queued in DB: ${action} ${entityType}:${entityId}`);
        
        return item.id;
    }

    private calculateRetryDelay(retryCount: number): number {
        // Exponential backoff with jitter
        const exponentialDelay = Math.min(
            this.baseRetryDelay * Math.pow(2, retryCount),
            300000 // Max 5 minutes
        );
        const jitter = exponentialDelay * 0.2 * Math.random();
        return exponentialDelay + jitter;
    }

    public async processQueue(tenantId?: string): Promise<{ processed: number; failed: number }> {
        if (this.isProcessing) return { processed: 0, failed: 0 };
        
        this.isProcessing = true;
        const processed: string[] = [];
        const failed: string[] = [];
        
        // Use provided tenantId or fallback to environment (for single-tenant local nodes)
        const tId = tenantId || process.env.HOSPITAL_TENANT_ID;
        if (!tId) {
            console.error('[SyncEngine] No tenant ID provided for queue processing');
            this.isProcessing = false;
            return { processed: 0, failed: 0 };
        }

        const cloudUrl = process.env.CLOUD_SYNC_URL || 'https://cloud.amisimedos.com/api/_sync';
        
        try {
            const db = await getTenantDb(tId);
            
            // 1. Fetch pending items
            const pendingItems = await db.localSyncQueue.findMany({
                where: {
                    status: { in: ['PENDING', 'FAILED'] },
                    retryCount: { lt: this.maxRetries }
                },
                orderBy: { timestamp: 'asc' },
                take: 50 // Batch size
            });

            if (pendingItems.length === 0) {
                this.isProcessing = false;
                return { processed: 0, failed: 0 };
            }

            // 2. Lock items for syncing
            const idsToSync = pendingItems.map(i => i.id);
            await db.localSyncQueue.updateMany({
                where: { id: { in: idsToSync } },
                data: { status: 'SYNCING' }
            });

            // 3. Process items
            for (const item of pendingItems) {
                // If it's a failed item, check if it's time to retry based on exponential backoff
                if (item.status === 'FAILED') {
                    const retryDelay = this.calculateRetryDelay(item.retryCount);
                    const timeSinceLastUpdate = Date.now() - new Date(item.updatedAt).getTime();
                    if (timeSinceLastUpdate < retryDelay) {
                        // Skip for now, not ready to retry
                        await db.localSyncQueue.update({
                            where: { id: item.id },
                            data: { status: 'FAILED' }
                        });
                        continue;
                    }
                }

                try {
                    const response = await fetch(cloudUrl, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'x-tenant-id': tId
                        },
                        body: JSON.stringify({ batch: [item] }) // Syncing one by one for isolation, could batch in production
                    });
                    
                    if (response.ok) {
                        // Success: Delete or mark completed
                        await db.localSyncQueue.delete({ where: { id: item.id } });
                        processed.push(item.id);
                        this.emit('processed', item);
                    } else {
                        // Server error
                        await db.localSyncQueue.update({
                            where: { id: item.id },
                            data: { 
                                status: 'FAILED', 
                                retryCount: { increment: 1 },
                                lastError: `Server error: ${response.status}`
                            }
                        });
                        failed.push(item.id);
                    }
                } catch (error) {
                    // Network error
                    await db.localSyncQueue.update({
                        where: { id: item.id },
                        data: { 
                            status: 'FAILED', 
                            retryCount: { increment: 1 },
                            lastError: String(error)
                        }
                    });
                    failed.push(item.id);
                }
            }
        } catch (error) {
            console.error('[SyncEngine] Error processing queue:', error);
        } finally {
            this.isProcessing = false;
        }
        
        if (processed.length > 0 || failed.length > 0) {
            console.log(`[SyncEngine] Processed: ${processed.length}, Failed: ${failed.length}`);
        }
        
        return { processed: processed.length, failed: failed.length };
    }

    public async getQueueSize(tenantId?: string): Promise<number> {
        const tId = tenantId || process.env.HOSPITAL_TENANT_ID;
        if (!tId) return 0;
        try {
            const db = await getTenantDb(tId);
            return await db.localSyncQueue.count({
                where: { status: { in: ['PENDING', 'FAILED'] } }
            });
        } catch (error) {
            return 0;
        }
    }

    public async getStatus(): Promise<{ isOnline: boolean; queueSize: number; pendingCount: number; failedCount: number }> {
        const tId = process.env.HOSPITAL_TENANT_ID;
        let pendingCount = 0;
        let failedCount = 0;
        
        if (tId) {
            try {
                const db = await getTenantDb(tId);
                pendingCount = await db.localSyncQueue.count({ where: { status: 'PENDING' } });
                failedCount = await db.localSyncQueue.count({ where: { status: 'FAILED' } });
            } catch (e) {}
        }

        return {
            isOnline: this.isOnline,
            queueSize: pendingCount + failedCount,
            pendingCount,
            failedCount
        };
    }

    public shutdown(): void {
        if (this.checkInterval) clearInterval(this.checkInterval);
    }
}

export const offlineFallback = PersistentOfflineFallback.getInstance();