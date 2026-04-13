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

  private edgeUrl: string = '';
  private cloudUrl: string = '/api/trpc';

  private constructor() {}

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

  /**
   * Optimized Racing Ping
   * Probes both Edge and Cloud. Prioritizes Edge for clinical performance (LAN > WAN).
   */
  public async checkConnectivity() {
    const edgeProbe = isReachable(`${this.edgeUrl}/api/health`, 1000);
    const cloudProbe = isReachable(window.location.origin + '/api/health', 3000);

    try {
      const edgeAlive = await edgeProbe;
      if (edgeAlive) {
        this.setState('EDGE_ONLINE');
        return;
      }

      const cloudAlive = await cloudProbe;
      if (cloudAlive) {
        this.setState('CLOUD_ONLINE');
      } else {
        this.setState('OFFLINE');
      }
    } catch (err) {
      this.setState('OFFLINE');
    }
  }

  /**
   * Resolves the target URL for a specific request.
   * If meta.cloudOnly is true, it always returns the Cloud Hub.
   */
  public getResolvedUrl(isCloudOnly?: boolean): string {
    if (isCloudOnly) return this.cloudUrl;
    
    switch (this.state) {
      case 'EDGE_ONLINE': return this.edgeUrl;
      case 'CLOUD_ONLINE': return this.cloudUrl;
      default: return this.cloudUrl; // Default to cloud for safety
    }
  }

  private startHeartbeat() {
    if (this.checkInterval) clearInterval(this.checkInterval);
    this.checkConnectivity();
    this.checkInterval = setInterval(() => this.checkConnectivity(), 5000);
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
    await axios.get(url, { timeout });
    return true;
  } catch (err) {
    return false;
  }
}

export const sentinel = ConnectivitySentinel.getInstance();
