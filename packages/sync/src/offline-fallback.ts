import { EventEmitter } from 'events';
import { isOffline } from './connectivity';
import crypto from 'crypto';

export interface OfflineQueueItem {
    id: string;
    entityType: string;
    entityId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    payload: any;
    timestamp: Date;
    retries: number;
    lastError?: string;
}

export interface SyncQueueRecord {
    id: string;
    entityType: string;
    entityId: string;
    action: string;
    payload: any;
    encryptedPayload?: string;
    timestamp: Date;
    retries: number;
    lastError?: string;
    direction: 'OUTGOING';
    sequenceNumber: bigint;
    isSynced: boolean;
}

class OfflineFallback extends EventEmitter {
    private static instance: OfflineFallback;
    private queue: OfflineQueueItem[] = [];
    private isProcessing = false;
    private isOnline = true;
    private checkInterval: NodeJS.Timeout | null = null;
    private retrySchedule: Map<string, NodeJS.Timeout> = new Map();
    private maxRetries = 5;
    private baseRetryDelay = 2000;

    private constructor() {
        super();
    }

    public static getInstance(): OfflineFallback {
        if (!OfflineFallback.instance) {
            OfflineFallback.instance = new OfflineFallback();
        }
        return OfflineFallback.instance;
    }

    public async initialize(): Promise<void> {
        this.isOnline = !(await isOffline());
        console.log(`[OfflineFallback] Initialized. Online: ${this.isOnline}`);
        
        this.checkInterval = setInterval(async () => {
            const wasOnline = this.isOnline;
            this.isOnline = !(await isOffline());
            
            if (!wasOnline && this.isOnline) {
                console.log('[OfflineFallback] Connection restored. Processing queue...');
                this.emit('online');
                await this.processQueue();
            } else if (wasOnline && !this.isOnline) {
                console.log('[OfflineFallback] Connection lost. Operating in offline mode.');
                this.emit('offline');
            }
        }, 10000);
    }

    public enqueue(entityType: string, entityId: string, action: 'CREATE' | 'UPDATE' | 'DELETE', payload: any): string {
        const id = `sync_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        const item: OfflineQueueItem = {
            id,
            entityType,
            entityId,
            action,
            payload,
            timestamp: new Date(),
            retries: 0
        };
        
        this.queue.push(item);
        this.emit('queued', item);
        console.log(`[OfflineFallback] Queued: ${action} ${entityType}:${entityId}`);
        
        return id;
    }

    public getQueueSize(): number {
        return this.queue.length;
    }

    public getQueue(): OfflineQueueItem[] {
        return [...this.queue];
    }

    public getPendingItems(): OfflineQueueItem[] {
        return this.queue.filter(item => item.retries < this.maxRetries);
    }

    public clearQueue(): void {
        this.queue = [];
        this.retrySchedule.forEach(timeout => clearTimeout(timeout));
        this.retrySchedule.clear();
        console.log('[OfflineFallback] Queue cleared');
    }

    public markFailed(itemId: string, error: string): void {
        const item = this.queue.find(i => i.id === itemId);
        if (item) {
            item.lastError = error;
            item.retries++;
            
            if (item.retries >= this.maxRetries) {
                console.error(`[OfflineFallback] Item ${itemId} exceeded max retries, moving to dead letter`);
                this.emit('dead-letter', item);
            } else {
                const delay = this.calculateRetryDelay(item.retries);
                console.log(`[OfflineFallback] Scheduling retry for ${itemId} in ${delay}ms`);
                
                const timeout = setTimeout(async () => {
                    this.retrySchedule.delete(itemId);
                    await this.processQueue();
                }, delay);
                
                this.retrySchedule.set(itemId, timeout);
            }
        }
    }

    private calculateRetryDelay(retryCount: number): number {
        const exponentialDelay = Math.min(
            this.baseRetryDelay * Math.pow(2, retryCount - 1),
            300000
        );
        const jitter = exponentialDelay * 0.2 * Math.random();
        return exponentialDelay + jitter;
    }

    public async processQueue(): Promise<{ processed: number; failed: number }> {
        if (this.isProcessing || this.queue.length === 0) {
            return { processed: 0, failed: 0 };
        }
        
        if (!(await isOffline())) {
            this.isOnline = true;
        }
        
        if (!this.isOnline) {
            console.log('[OfflineFallback] Offline - queue paused');
            return { processed: 0, failed: 0 };
        }
        
        this.isProcessing = true;
        const processed: string[] = [];
        const failed: string[] = [];
        
        const cloudUrl = process.env.CLOUD_SYNC_URL;
        if (!cloudUrl) {
            console.log('[OfflineFallback] No cloud URL configured');
            this.isProcessing = false;
            return { processed: 0, failed: 0 };
        }
        
        const pendingItems = this.getPendingItems();
        
        for (const item of pendingItems) {
            try {
                const response = await fetch(`${cloudUrl}`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'x-tenant-id': process.env.HOSPITAL_TENANT_ID || ''
                    },
                    body: JSON.stringify({
                        batch: [{
                            ...item,
                            direction: 'OUTGOING',
                            sequenceNumber: BigInt(Date.now()),
                            isSynced: false
                        }]
                    })
                });
                
                if (response.ok) {
                    processed.push(item.id);
                    this.queue = this.queue.filter(q => q.id !== item.id);
                    this.emit('processed', item);
                } else if (response.status >= 500) {
                    this.markFailed(item.id, `Server error: ${response.status}`);
                    failed.push(item.id);
                    break;
                } else {
                    this.markFailed(item.id, `Client error: ${response.status}`);
                    failed.push(item.id);
                }
            } catch (error) {
                console.log(`[OfflineFallback] Network error for ${item.id}: ${error}`);
                this.markFailed(item.id, String(error));
                failed.push(item.id);
                break;
            }
        }
        
        this.isProcessing = false;
        
        if (processed.length > 0) {
            console.log(`[OfflineFallback] Processed ${processed.length} items`);
        }
        
        return { processed: processed.length, failed: failed.length };
    }

    public shutdown(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        this.retrySchedule.forEach(timeout => clearTimeout(timeout));
        this.retrySchedule.clear();
        console.log('[OfflineFallback] Shutdown');
    }

    public getStatus(): { isOnline: boolean; queueSize: number; pendingCount: number; failedCount: number } {
        return {
            isOnline: this.isOnline,
            queueSize: this.queue.length,
            pendingCount: this.getPendingItems().length,
            failedCount: this.queue.filter(i => i.retries >= this.maxRetries).length
        };
    }
}

export const offlineFallback = OfflineFallback.getInstance();