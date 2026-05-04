'use server';

import { eventStore } from '@/lib/event-system/event-store';
import { SystemEvent, EventType, EventDomain, EventSeverity, EventStoreQuery } from '@/lib/event-system/types';

// ─── Server Actions for Event Log ────────────────────────────────────────

export interface EventLogEntry extends SystemEvent {
  sequenceNumber?: string;
}

export interface EventLogResult {
  events: EventLogEntry[];
  totalCount: number;
  hasMore: boolean;
  replayCursor?: string;
}

export interface EventStats {
  totalEvents: number;
  byDomain: Array<{ domain: string; count: number }>;
  bySeverity: Array<{ severity: string; count: number }>;
  byHour: Array<{ hour: string; count: number }>;
}

export async function getEventLog(query: EventStoreQuery): Promise<EventLogResult> {
  const result = await eventStore.query(query);

  return {
    events: result.events,
    totalCount: result.totalCount,
    hasMore: result.hasMore,
    replayCursor: result.replayCursor,
  };
}

export async function getEventStats(tenantId: string, hours: number = 24): Promise<EventStats> {
  return eventStore.getEventStats(tenantId, hours);
}

export async function getPatientTimeline(
  tenantId: string,
  patientId: string,
  limit: number = 50
): Promise<EventLogEntry[]> {
  return eventStore.getPatientTimeline(tenantId, patientId, limit);
}

export async function replayEvents(
  tenantId: string,
  cursor: string,
  limit: number = 100
): Promise<EventLogResult> {
  const result = await eventStore.replayFromCursor(tenantId, cursor, limit);

  return {
    events: result.events,
    totalCount: result.totalCount,
    hasMore: result.hasMore,
    replayCursor: result.replayCursor,
  };
}

export async function getEventsByCorrelationId(
  tenantId: string,
  correlationId: string
): Promise<EventLogEntry[]> {
  return eventStore.getByCorrelationId(tenantId, correlationId);
}
