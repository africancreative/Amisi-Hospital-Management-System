import { EventEmitter } from 'events';
import axios from 'axios';

export type ConnectionStatus = 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'UNKNOWN';

export interface ConnectivityState {
    status: ConnectionStatus;
    lastChecked: Date;
    lastOnline: Date | null;
    lastOffline: Date | null;
    consecutiveFailures: number;
    consecutiveSuccesses: number;
    latency: number | null;
    endpoints: string[];
}

export interface EndpointHealth {
    url: string;
    healthy: boolean;
    latency: number;
    error?: string;
}

const DEFAULT_ENDPOINTS = [
    'https://api.amisigenuine.com/api/health',
    'https://amisigenuine.com/api/health',
    'https://dashboard.amisigenuine.com/api/health'
];

const CONFIG = {
    checkInterval: 10000,
    timeout: 3000,
    maxConsecutiveFailures: 3,
    maxConsecutiveSuccesses: 2,
    degradedThreshold: 5000,
    recoveryDelay: 5000
};

class ConnectivityManager extends EventEmitter {
    private static instance: ConnectivityManager;
    private state: ConnectivityState;
    private checkInterval: NodeJS.Timeout | null = null;
    private isRunning = false;
    private endpoints: string[];

    private constructor() {
        super();
        this.endpoints = DEFAULT_ENDPOINTS;
        this.state = {
            status: 'UNKNOWN',
            lastChecked: new Date(),
            lastOnline: null,
            lastOffline: null,
            consecutiveFailures: 0,
            consecutiveSuccesses: 0,
            latency: null,
            endpoints: this.endpoints
        };
    }

    public static getInstance(): ConnectivityManager {
        if (!ConnectivityManager.instance) {
            ConnectivityManager.instance = new ConnectivityManager();
        }
        return ConnectivityManager.instance;
    }

    public setEndpoints(endpoints: string[]): void {
        this.endpoints = endpoints;
        this.state.endpoints = endpoints;
    }

    public async start(): Promise<void> {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('[Connectivity] Starting connectivity monitor...');
        
        await this.check();
        
        this.checkInterval = setInterval(async () => {
            await this.check();
        }, CONFIG.checkInterval);
    }

    public stop(): void {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        this.isRunning = false;
        console.log('[Connectivity] Stopped');
    }

    public async check(): Promise<ConnectivityState> {
        const results = await this.checkAllEndpoints();
        const healthyEndpoints = results.filter(r => r.healthy);
        
        const now = new Date();
        
        if (healthyEndpoints.length > 0) {
            const avgLatency = healthyEndpoints.reduce((sum, r) => sum + r.latency, 0) / healthyEndpoints.length;
            
            this.state.consecutiveFailures = 0;
            this.state.consecutiveSuccesses++;
            this.state.lastOnline = now;
            this.state.latency = avgLatency;
            
            if (avgLatency > CONFIG.degradedThreshold) {
                this.updateStatus('DEGRADED');
            } else if (this.state.status === 'UNKNOWN' || this.state.status === 'OFFLINE') {
                if (this.state.consecutiveSuccesses >= CONFIG.maxConsecutiveSuccesses) {
                    this.updateStatus('ONLINE');
                }
            } else if (this.state.status === 'DEGRADED' && avgLatency < CONFIG.degradedThreshold) {
                this.updateStatus('ONLINE');
            }
        } else {
            this.state.consecutiveSuccesses = 0;
            this.state.consecutiveFailures++;
            this.state.lastOffline = now;
            
            if (this.state.consecutiveFailures >= CONFIG.maxConsecutiveFailures) {
                this.updateStatus('OFFLINE');
            }
        }
        
        this.state.lastChecked = now;
        return this.state;
    }

    private async checkAllEndpoints(): Promise<EndpointHealth[]> {
        const results: EndpointHealth[] = [];
        
        await Promise.all(
            this.endpoints.map(async (url) => {
                const result: EndpointHealth = { url, healthy: false, latency: 0 };
                const start = Date.now();
                
                try {
                    await axios.get(url, { timeout: CONFIG.timeout });
                    result.latency = Date.now() - start;
                    result.healthy = true;
                } catch (error: any) {
                    result.error = error.message;
                    result.latency = Date.now() - start;
                }
                
                results.push(result);
            })
        );
        
        return results;
    }

    private updateStatus(newStatus: ConnectionStatus): void {
        const oldStatus = this.state.status;
        
        if (oldStatus !== newStatus) {
            this.state.status = newStatus;
            console.log(`[Connectivity] Status: ${oldStatus} → ${newStatus}`);
            this.emit('statusChange', { oldStatus, newStatus, state: this.state });
            
            if (newStatus === 'ONLINE') {
                this.emit('online');
            } else if (newStatus === 'OFFLINE') {
                this.emit('offline');
            }
        }
    }

    public getState(): ConnectivityState {
        return { ...this.state };
    }

    public isOnline(): boolean {
        return this.state.status === 'ONLINE' || this.state.status === 'DEGRADED';
    }

    public isOffline(): boolean {
        return this.state.status === 'OFFLINE';
    }

    public getLatency(): number | null {
        return this.state.latency;
    }
}

export const connectivityManager = ConnectivityManager.getInstance();