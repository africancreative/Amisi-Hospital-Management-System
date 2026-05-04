/**
 * AmisiMedOS Real-Time Gateway
 * Unified WebSocket + SSE bridge with tenant-isolated channels.
 *
 * Architecture:
 *   Server Actions → eventBus.publish() → RealtimeHub (EventEmitter)
 *                                         ↓
 *                            RealtimeGateway (Socket.io + SSE)
 *                                         ↓
 *                    ┌─────────┬──────────┼──────────┬─────────┐
 *                    │ queue   │ chat     │ billing  │ clinical│ ...
 *                    └─────────┴──────────┴──────────┴─────────┘
 *
 * Channel Pattern: {tenantId}:{channel}:{resource}:{id}
 *   e.g. tenant-abc:queue:department:OPD
 *        tenant-abc:chat:user:usr-123
 *        tenant-abc:billing:patient:pt-456
 */

import { EventEmitter } from 'events';
import { RealtimeEvent, RealtimeEventType } from './types';

// ─── Channel Definitions ─────────────────────────────────────────────────

export type ChannelName =
  | 'queue'
  | 'chat'
  | 'billing'
  | 'clinical'
  | 'inventory'
  | 'adt'
  | 'lab'
  | 'pharmacy'
  | 'system'
  | 'events';

export interface ChannelSubscription {
  tenantId: string;
  channel: ChannelName;
  resource?: string;
  resourceId?: string;
  handler: (event: RealtimeEvent) => void;
}

// ─── Channel Routing Map ─────────────────────────────────────────────────
// Maps RealtimeEventType → ChannelName for automatic channel dispatch

const CHANNEL_MAP: Partial<Record<RealtimeEventType, ChannelName>> = {
  QUEUE_UPDATED: 'queue',
  PATIENT_ADMITTED: 'adt',
  PATIENT_TRANSFERRED: 'adt',
  PATIENT_DISCHARGED: 'adt',
  BED_STATUS_CHANGED: 'adt',
  CHAT_MESSAGE_RECEIVED: 'chat',
  MESSAGE_SENT: 'chat',
  PAYMENT_RECEIVED: 'billing',
  BILL_GENERATED: 'billing',
  VITALS_UPDATED: 'clinical',
  PATIENT_MUTATED: 'clinical',
  CONSULTATION_STARTED: 'clinical',
  CONSULTATION_COMPLETED: 'clinical',
  INVENTORY_DISPENSED: 'inventory',
  INVENTORY_ALERT: 'inventory',
  INVENTORY_RESTOCKED: 'inventory',
  STOCK_DISPENSED: 'inventory',
  LOW_STOCK_ALERT: 'inventory',
  OUT_OF_STOCK_ALERT: 'inventory',
  LAB_ORDERED: 'lab',
  LAB_RESULT_READY: 'lab',
  CRITICAL_LAB_ALERT: 'lab',
  PRESCRIPTION_RECEIVED: 'pharmacy',
  PRESCRIPTION_DISPENSED: 'pharmacy',
};

export function getChannelForEventType(type: RealtimeEventType): ChannelName {
  return CHANNEL_MAP[type] ?? 'events';
}

// ─── RealtimeGateway — Single Source of Truth ────────────────────────────

class RealtimeGateway extends EventEmitter {
  private static instance: RealtimeGateway;
  private subscriptions = new Map<string, ChannelSubscription[]>();
  private tenantChannels = new Map<string, Set<string>>();

  private constructor() {
    super();
    this.setMaxListeners(200);
  }

  static getInstance(): RealtimeGateway {
    if (!RealtimeGateway.instance) {
      RealtimeGateway.instance = new RealtimeGateway();
    }
    return RealtimeGateway.instance;
  }

  // ─── Publish (from server actions) ────────────────────────────────────

  publish(event: Omit<RealtimeEvent, 'timestamp'> & { timestamp?: string }): RealtimeEvent {
    const fullEvent: RealtimeEvent = {
      ...event,
      timestamp: event.timestamp ?? new Date().toISOString(),
    };

    const channel = getChannelForEventType(fullEvent.type as RealtimeEventType);

    // Emit to global tenant stream (SSE compatibility)
    this.emit(`stream:${fullEvent.tenantId}`, fullEvent);

    // Emit to specific channel
    this.emit(`channel:${fullEvent.tenantId}:${channel}`, fullEvent);

    // Emit to resource-specific channel if applicable
    if (fullEvent.resource) {
      this.emit(`channel:${fullEvent.tenantId}:${channel}:${fullEvent.resource}`, fullEvent);
      if (fullEvent.id) {
        this.emit(`channel:${fullEvent.tenantId}:${channel}:${fullEvent.resource}:${fullEvent.id}`, fullEvent);
      }
    }

    console.log(`[RealtimeGateway] ${fullEvent.type} → ${channel} (tenant: ${fullEvent.tenantId})`);

    return fullEvent;
  }

  // ─── Subscribe (from SSE routes) ──────────────────────────────────────

  subscribeToStream(tenantId: string, handler: (event: RealtimeEvent) => void): () => void {
    this.on(`stream:${tenantId}`, handler);
    return () => this.off(`stream:${tenantId}`, handler);
  }

  subscribeToChannel(
    tenantId: string,
    channel: ChannelName,
    handler: (event: RealtimeEvent) => void
  ): () => void {
    this.on(`channel:${tenantId}:${channel}`, handler);
    return () => this.off(`channel:${tenantId}:${channel}`, handler);
  }

  subscribeToResource(
    tenantId: string,
    channel: ChannelName,
    resource: string,
    resourceId: string,
    handler: (event: RealtimeEvent) => void
  ): () => void {
    const key = `channel:${tenantId}:${channel}:${resource}:${resourceId}`;
    this.on(key, handler);
    return () => this.off(key, handler);
  }

  // ─── Socket.io Integration ────────────────────────────────────────────

  broadcastToSocketRoom(room: string, event: string, data: unknown): void {
    this.emit(`socket:room:${room}`, { event, data });
  }

  onSocketRoom(room: string, handler: (payload: { event: string; data: unknown }) => void): () => void {
    this.on(`socket:room:${room}`, handler);
    return () => this.off(`socket:room:${room}`, handler);
  }

  // ─── Stats ────────────────────────────────────────────────────────────

  getActiveChannels(tenantId: string): string[] {
    return Array.from(this.tenantChannels.get(tenantId) ?? []);
  }

  recordChannel(tenantId: string, channel: string): void {
    if (!this.tenantChannels.has(tenantId)) {
      this.tenantChannels.set(tenantId, new Set());
    }
    this.tenantChannels.get(tenantId)!.add(channel);
  }
}

export const realtimeGateway = RealtimeGateway.getInstance();
