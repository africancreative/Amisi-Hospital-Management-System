import axios from 'axios';

export type ConnectivityState = 'EDGE_ONLINE' | 'CLOUD_ONLINE' | 'OFFLINE';

/**
 * High-fidelity Connectivity Sentinel
 * 
 * Manages the racing heartbeat logic to determine if we should route traffic
 * to the Local Edge LAN or the Global Cloud WAN.
 */
export class ConnectivitySentinel {
  private static instance: ConnectivitySentinel;
  private state: ConnectivityState = 'CLOUD_ONLINE';
  private listeners: ((state: ConnectivityState) => void)[] = [];
  private checkInterval: NodeJS.Timeout | null = null;
  private isChecking = false;

  private edgeUrl: string = '';
  private cloudUrl: string = '/api/trpc';

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.forceCheck());
      window.addEventListener('offline', () => this.forceCheck());
    }
  }

  public static getInstance(): ConnectivitySentinel {
    if (!this.instance) {
      this.instance = new ConnectivitySentinel();
    }
    return this.instance;
  }

  public init(edgeUrl: string, cloudUrl: string = '/api/trpc') {
    this.edgeUrl = edgeUrl;
    this.cloudUrl = cloudUrl;
    this.startHeartbeat();
  }

  public getState(): ConnectivityState {
    return this.state;
  }

  public subscribe(listener: (state: ConnectivityState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private setState(newState: ConnectivityState) {
    if (this.state !== newState) {
      console.log(`[Sentinel] Connection State Shift: ${this.state} -> ${newState}`);
      this.state = newState;
      this.listeners.forEach(l => l(newState));
    }
  }

  public async forceCheck() {
    if (this.isChecking) return;
    await this.checkConnectivity();
  }

  /**
   * Optimized Racing Ping
   * Probes both Edge and Cloud. Prioritizes Edge for clinical performance (LAN > WAN).
   */
  public async checkConnectivity() {
    if (this.isChecking) return;
    this.isChecking = true;

    try {
      // 1. Browser Status Hint
      const isBrowserOffline = typeof navigator !== 'undefined' && !navigator.onLine;

      // 2. Racing Probes with slightly tighter timeouts for edge
      const edgeProbe = isReachable(`${this.edgeUrl}/api/health`, 1200);
      const cloudProbe = isReachable(window.location.origin + '/api/health', 2500);

      const [edgeAlive, cloudAlive] = await Promise.all([edgeProbe, cloudProbe]);

      if (edgeAlive) {
        // We favor Edge if it's reachable (LAN speed)
        this.setState('EDGE_ONLINE');
      } else if (cloudAlive && !isBrowserOffline) {
        this.setState('CLOUD_ONLINE');
      } else {
        this.setState('OFFLINE');
      }
    } catch (err) {
      this.setState('OFFLINE');
    } finally {
      this.isChecking = false;
    }
  }

  /**
   * Resolves the target URL for a specific request.
   */
  public getResolvedUrl(isCloudOnly?: boolean): string {
    if (isCloudOnly) return this.cloudUrl;
    
    switch (this.state) {
      case 'EDGE_ONLINE': return this.edgeUrl;
      case 'CLOUD_ONLINE': return this.cloudUrl;
      default: return this.cloudUrl;
    }
  }

  private startHeartbeat() {
    if (this.checkInterval) clearInterval(this.checkInterval);
    this.checkConnectivity();
    
    // Check every 8 seconds by default, or 4 seconds if we are offline
    const interval = this.state === 'OFFLINE' ? 4000 : 8000;
    this.checkInterval = setInterval(() => this.checkConnectivity(), interval);
  }

  public stop() {
    if (this.checkInterval) clearInterval(this.checkInterval);
  }
}

/**
 * Utility: Network Reachability Probe
 */
export async function isReachable(url: string, timeout: number = 2000): Promise<boolean> {
  try {
    // Avoid CORS issues for simple health checks if possible
    await axios.get(url, { 
        timeout,
        headers: { 'Cache-Control': 'no-cache' }
    });
    return true;
  } catch (err) {
    return false;
  }
}

export const sentinel = ConnectivitySentinel.getInstance();
