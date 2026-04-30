import { EventEmitter } from 'events';
import { connectivityManager, ConnectivityState, ConnectionStatus } from './connectivity-auto';
import { offlineFallback, SyncQueueRecord } from './offline-fallback';
import crypto from 'crypto';

export type RouteStrategy = 'online-first' | 'offline-first' | 'smart';

export interface RouteOptions {
    strategy: RouteStrategy;
    cloudUrl: string;
    localFallback: boolean;
    timeout: number;
    retries: number;
}

export interface RouteResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    source: 'cloud' | 'local' | 'queue';
    latency?: number;
    timestamp: Date;
}

const DEFAULT_OPTIONS: RouteOptions = {
    strategy: 'smart',
    cloudUrl: process.env.CLOUD_SYNC_URL || 'https://api.amisigenuine.com/api',
    localFallback: true,
    timeout: 5000,
    retries: 3
};

class SyncRouter extends EventEmitter {
    private static instance: SyncRouter;
    private options: RouteOptions;
    private isProcessingQueue = false;

    private constructor() {
        super();
        this.options = DEFAULT_OPTIONS;
        this.setupEventListeners();
    }

    public static getInstance(): SyncRouter {
        if (!SyncRouter.instance) {
            SyncRouter.instance = new SyncRouter();
        }
        return SyncRouter.instance;
    }

    public configure(options: Partial<RouteOptions>): void {
        this.options = { ...this.options, ...options };
    }

    private setupEventListeners(): void {
        connectivityManager.on('online', () => {
            console.log('[SyncRouter] Connection restored. Processing queue...');
            this.processQueue();
        });

        connectivityManager.on('offline', () => {
            console.log('[SyncRouter] Connection lost. Switching to offline mode.');
        });

        connectivityManager.on('statusChange', ({ oldStatus, newStatus }) => {
            console.log(`[SyncRouter] Connectivity: ${oldStatus} → ${newStatus}`);
            this.emit('connectivityChange', { oldStatus, newStatus });
        });
    }

    public async start(): Promise<void> {
        await connectivityManager.start();
        console.log('[SyncRouter] Started');
    }

    public stop(): void {
        connectivityManager.stop();
    }

    public getConnectivityState(): ConnectivityState {
        return connectivityManager.getState();
    }

    /**
     * Smart Route - Routes request based on connectivity state
     */
    public async route<T>(
        endpoint: string,
        options?: Partial<{ method: string; body: any; localFn: () => Promise<T> }>
    ): Promise<RouteResult<T>> {
        const method = options?.method || 'GET';
        const body = options?.body;
        const localFn = options?.localFn;

        const connectivity = connectivityManager.getState();

        switch (this.options.strategy) {
            case 'online-first':
                return this.routeOnlineFirst(endpoint, method, body, localFn);
            
            case 'offline-first':
                return this.routeOfflineFirst(endpoint, method, body, localFn);
            
            case 'smart':
            default:
                return this.routeSmart(endpoint, method, body, localFn, connectivity);
        }
    }

    /**
     * Online First - Try cloud, fallback to local
     */
    private async routeOnlineFirst<T>(
        endpoint: string,
        method: string,
        body?: any,
        localFn?: () => Promise<T>
    ): Promise<RouteResult<T>> {
        const startTime = Date.now();

        if (connectivityManager.isOnline()) {
            try {
                const data = await this.requestCloud<T>(endpoint, method, body);
                return {
                    success: true,
                    data,
                    source: 'cloud',
                    latency: Date.now() - startTime,
                    timestamp: new Date()
                };
            } catch (error) {
                console.warn(`[SyncRouter] Cloud request failed: ${error}`);
            }
        }

        if (localFn && this.options.localFallback) {
            try {
                const data = await localFn();
                return {
                    success: true,
                    data,
                    source: 'local',
                    latency: Date.now() - startTime,
                    timestamp: new Date()
                };
            } catch (error) {
                return {
                    success: false,
                    error: `Local fallback failed: ${error}`,
                    source: 'local',
                    timestamp: new Date()
                };
            }
        }

        return this.queueRequest(endpoint, method, body);
    }

    /**
     * Offline First - Use local, sync to cloud when online
     */
    private async routeOfflineFirst<T>(
        endpoint: string,
        method: string,
        body?: any,
        localFn?: () => Promise<T>
    ): Promise<RouteResult<T>> {
        const startTime = Date.now();

        if (localFn) {
            try {
                const data = await localFn();
                this.queueForSync(endpoint, method, body);
                return {
                    success: true,
                    data,
                    source: 'local',
                    latency: Date.now() - startTime,
                    timestamp: new Date()
                };
            } catch (error) {
                console.warn(`[SyncRouter] Local request failed: ${error}`);
            }
        }

        if (connectivityManager.isOnline()) {
            try {
                const data = await this.requestCloud<T>(endpoint, method, body);
                return {
                    success: true,
                    data,
                    source: 'cloud',
                    latency: Date.now() - startTime,
                    timestamp: new Date()
                };
            } catch (error) {
                return this.queueRequest(endpoint, method, body);
            }
        }

        return {
            success: false,
            error: 'Offline and no local fallback available',
            source: 'queue',
            timestamp: new Date()
        };
    }

    /**
     * Smart Route - Adaptive based on connectivity + latency
     */
    private async routeSmart<T>(
        endpoint: string,
        method: string,
        body: any,
        localFn: (() => Promise<T>) | undefined,
        connectivity: ConnectivityState
    ): Promise<RouteResult<T>> {
        const startTime = Date.now();

        if (connectivity.status === 'OFFLINE') {
            console.log('[SyncRouter] Offline - using local fallback');
            return this.routeOfflineFirst(endpoint, method, body, localFn);
        }

        if (connectivity.status === 'DEGRADED') {
            console.log('[SyncRouter] Degraded - preferring local for speed');
            if (localFn) {
                const localData = await localFn();
                this.queueForSync(endpoint, method, body);
                return {
                    success: true,
                    data: localData,
                    source: 'local',
                    latency: Date.now() - startTime,
                    timestamp: new Date()
                };
            }
        }

        return this.routeOnlineFirst(endpoint, method, body, localFn);
    }

    private async requestCloud<T>(endpoint: string, method: string, body?: any): Promise<T> {
        const url = `${this.options.cloudUrl}${endpoint}`;
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'x-tenant-id': process.env.HOSPITAL_TENANT_ID || ''
            },
            body: body ? JSON.stringify(body) : undefined,
            signal: AbortSignal.timeout(this.options.timeout)
        });

        if (!response.ok) {
            throw new Error(`Cloud request failed: ${response.status}`);
        }

        return response.json();
    }

    private queueRequest<T>(endpoint: string, method: string, body?: any): RouteResult<T> {
        const tenantId = process.env.HOSPITAL_TENANT_ID || 'GLOBAL';
        const queueId = offlineFallback.enqueue(
            tenantId,
            'API',
            crypto.randomUUID(),
            method === 'POST' || method === 'PUT' ? 'CREATE' : 'UPDATE',
            { endpoint, method, body }
        );

        return {
            success: true,
            error: 'Request queued for sync',
            source: 'queue',
            timestamp: new Date()
        };
    }

    private queueForSync(endpoint: string, method: string, body?: any): void {
        const tenantId = process.env.HOSPITAL_TENANT_ID || 'GLOBAL';
        offlineFallback.enqueue(
            tenantId,
            'API',
            crypto.randomUUID(),
            method === 'POST' || method === 'PUT' ? 'CREATE' : 'UPDATE',
            { endpoint, method, body }
        );
    }

    public async processQueue(): Promise<{ processed: number; failed: number }> {
        return offlineFallback.processQueue();
    }

    public async getQueueStatus(): Promise<{ isOnline: boolean; queueSize: number; pendingCount: number; failedCount: number }> {
        return await offlineFallback.getStatus();
    }
}

export const syncRouter = SyncRouter.getInstance();