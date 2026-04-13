import { EventEmitter } from 'events';
import { RealtimeEvent, RealtimeEventType } from './types';

/**
 * AmisiMedOS Real-Time Hub
 * Orchestrates event broadcasting across the clinical planes.
 */
class RealtimeHub extends EventEmitter {
  private static instance: RealtimeHub;

  constructor() {
    super();
    this.setMaxListeners(100); // Support many concurrent SSE streams
  }

  public static getInstance(): RealtimeHub {
    if (!RealtimeHub.instance) {
      RealtimeHub.instance = new RealtimeHub();
    }
    return RealtimeHub.instance;
  }

  /**
   * Broadcast an event to all subscribers in a specific tenant.
   */
  public broadcast(
    tenantId: string, 
    type: RealtimeEventType, 
    resource: string, 
    id: string,
    payload?: any
  ) {
    const event: RealtimeEvent = {
        tenantId,
        type,
        resource,
        id,
        payload,
        timestamp: new Date().toISOString()
    };
    
    console.log(`[Realtime Hub] Broadcasting ${type} for tenant ${tenantId}`);
    this.emit(`event:${tenantId}`, event);
  }

  /**
   * Subscribe to events for a specific tenant.
   */
  public subscribe(tenantId: string, callback: (event: RealtimeEvent) => void) {
    this.on(`event:${tenantId}`, callback);
    return () => this.off(`event:${tenantId}`, callback);
  }
}

export const realtimeHub = RealtimeHub.getInstance();
