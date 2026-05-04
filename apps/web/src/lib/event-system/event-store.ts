import { getTenantDb } from '@/lib/db';
import { headers } from 'next/headers';
import {
  SystemEvent,
  EventType,
  EventDomain,
  EventSeverity,
  EventStoreQuery,
  EventStoreResult,
  EventPayloadMap,
} from './types';

// ─── Helpers ─────────────────────────────────────────────────────────────

function getEventTypeDomain(type: EventType): EventDomain {
  if (type.startsWith('PATIENT_')) return 'PATIENT';
  if (type.startsWith('TRIAGE_') || type === 'ESI_LEVEL_ASSIGNED') return 'TRIAGE';
  if (
    type.startsWith('ENCOUNTER_') ||
    type.startsWith('CONSULTATION_') ||
    type === 'DIAGNOSIS_ADDED' ||
    type === 'CLINICAL_NOTE_ADDED' ||
    type === 'CLINICAL_NOTE_SIGNED' ||
    type === 'VITALS_RECORDED' ||
    type === 'ALLERGY_ADDED' ||
    type === 'ALLERGY_UPDATED'
  ) return 'ENCOUNTER';
  if (type.startsWith('LAB_')) return 'LAB';
  if (type.startsWith('RADIOLOGY_')) return 'RADIOLOGY';
  if (
    type.startsWith('PRESCRIPTION_') ||
    type === 'DRUG_INTERACTION_ALERT' ||
    type === 'CONTROLLED_SUBSTANCE_DISPENSED'
  ) return 'PHARMACY';
  if (
    type.startsWith('BILL_') ||
    type.startsWith('PAYMENT_') ||
    type.startsWith('INSURANCE_')
  ) return 'BILLING';
  if (
    type.startsWith('STOCK_') ||
    type.startsWith('PURCHASE_ORDER_') ||
    type === 'LOW_STOCK_ALERT' ||
    type === 'OUT_OF_STOCK_ALERT' ||
    type === 'EXPIRY_ALERT' ||
    type === 'GOODS_RECEIVED'
  ) return 'INVENTORY';
  if (
    type.startsWith('EMPLOYEE_') ||
    type.startsWith('SHIFT_') ||
    type.startsWith('CLOCK_') ||
    type.startsWith('LEAVE_') ||
    type === 'PAYSLIP_READY' ||
    type === 'CREDENTIAL_EXPIRING'
  ) return 'HR';
  if (
    type.startsWith('PATIENT_ADMITTED') ||
    type.startsWith('PATIENT_TRANSFERRED') ||
    type.startsWith('PATIENT_DISCHARGED') ||
    type.startsWith('BED_')
  ) return 'ADT';
  if (type.startsWith('ICU_') || type === 'APACHE_SCORE_UPDATED' || type === 'MAR_UPDATED') return 'ICU';
  if (type.startsWith('SURGERY_') || type.startsWith('PACU_')) return 'SURGERY';
  if (
    type.startsWith('ANC_') ||
    type.startsWith('LABOUR_') ||
    type.startsWith('DELIVERY_') ||
    type.startsWith('POSTNATAL_') ||
    type === 'PARTOGRAM_ALERT' ||
    type === 'FOETAL_DISTRESS' ||
    type === 'HIGH_RISK_PREGNANCY' ||
    type === 'NICU_ALERT'
  ) return 'MATERNITY';
  if (
    type.startsWith('ONCOLOGY_') ||
    type.startsWith('CHEMO_') ||
    type === 'TOXICITY_REPORTED'
  ) return 'ONCOLOGY';
  return 'SYSTEM';
}

function getEventSeverity(type: EventType): EventSeverity {
  if (
    type.includes('CRITICAL') ||
    type.includes('EMERGENCY') ||
    type === 'OUT_OF_STOCK_ALERT' ||
    type === 'DRUG_INTERACTION_ALERT' ||
    type === 'FOETAL_DISTRESS' ||
    type === 'ONCOLOGY_EMERGENCY' ||
    type === 'ICU_ALARM' ||
    type === 'SYNC_FAILED'
  ) return 'CRITICAL';
  if (
    type.includes('ALERT') ||
    type.includes('REJECTED') ||
    type === 'LOW_STOCK_ALERT' ||
    type === 'EXPIRY_ALERT' ||
    type === 'CREDENTIAL_EXPIRING' ||
    type === 'LAB_SAMPLE_REJECTED'
  ) return 'WARNING';
  if (type.includes('CANCELLED') || type.includes('FAILED')) return 'ERROR';
  return 'INFO';
}

function extractEntityType(type: EventType): string {
  if (type.startsWith('PATIENT_')) return 'Patient';
  if (type.startsWith('TRIAGE_') || type === 'ESI_LEVEL_ASSIGNED') return 'Encounter';
  if (type.startsWith('CONSULTATION_')) return 'Encounter';
  if (type === 'VITALS_RECORDED') return 'Vitals';
  if (type === 'DIAGNOSIS_ADDED') return 'Diagnosis';
  if (type.startsWith('CLINICAL_NOTE_')) return 'ClinicalNote';
  if (type.startsWith('ENCOUNTER_')) return 'Encounter';
  if (type === 'ALLERGY_ADDED' || type === 'ALLERGY_UPDATED') return 'Allergy';
  if (type.startsWith('LAB_')) return 'LabOrder';
  if (type.startsWith('RADIOLOGY_')) return 'RadiologyOrder';
  if (type.startsWith('PRESCRIPTION_')) return 'Prescription';
  if (type === 'DRUG_INTERACTION_ALERT') return 'DrugInteraction';
  if (type === 'CONTROLLED_SUBSTANCE_DISPENSED') return 'ControlledSubstanceLog';
  if (type.startsWith('BILL_')) return 'Invoice';
  if (type.startsWith('PAYMENT_')) return 'Payment';
  if (type.startsWith('INSURANCE_')) return 'InsuranceClaim';
  if (type.startsWith('STOCK_')) return 'InventoryItem';
  if (type === 'LOW_STOCK_ALERT' || type === 'OUT_OF_STOCK_ALERT' || type === 'EXPIRY_ALERT') return 'StockAlert';
  if (type.startsWith('PURCHASE_ORDER_')) return 'PurchaseOrder';
  if (type === 'GOODS_RECEIVED') return 'GRN';
  if (type.startsWith('EMPLOYEE_')) return 'Employee';
  if (type.startsWith('SHIFT_')) return 'ShiftSchedule';
  if (type === 'CLOCK_IN' || type === 'CLOCK_OUT') return 'AttendanceLog';
  if (type.startsWith('LEAVE_')) return 'LeaveRequest';
  if (type === 'PAYSLIP_READY') return 'Payslip';
  if (type === 'CREDENTIAL_EXPIRING') return 'Employee';
  if (type.startsWith('PATIENT_ADMITTED') || type.startsWith('PATIENT_TRANSFERRED') || type.startsWith('PATIENT_DISCHARGED')) return 'Admission';
  if (type.startsWith('BED_')) return 'Bed';
  if (type.startsWith('ICU_')) return 'ICUMonitoring';
  if (type === 'APACHE_SCORE_UPDATED') return 'ICUMonitoring';
  if (type === 'MAR_UPDATED') return 'MedicationAdministration';
  if (type.startsWith('SURGERY_')) return 'SurgeryRequest';
  if (type.startsWith('PACU_')) return 'SurgeryPostOp';
  if (type.startsWith('ANC_')) return 'MaternityRecord';
  if (type.startsWith('LABOUR_')) return 'MaternityRecord';
  if (type.startsWith('DELIVERY_')) return 'DeliveryLog';
  if (type.startsWith('POSTNATAL_')) return 'MaternityRecord';
  if (type === 'PARTOGRAM_ALERT' || type === 'FOETAL_DISTRESS') return 'DeliveryLog';
  if (type === 'HIGH_RISK_PREGNANCY') return 'MaternityRecord';
  if (type === 'NICU_ALERT') return 'Patient';
  if (type.startsWith('ONCOLOGY_')) return 'OncologyTreatment';
  if (type.startsWith('CHEMO_')) return 'ChemoSession';
  if (type === 'TOXICITY_REPORTED') return 'ChemoSession';
  if (type.startsWith('TENANT_')) return 'HospitalSettings';
  if (type.startsWith('MODULE_')) return 'HospitalSettings';
  if (type === 'SYSTEM_MAINTENANCE') return 'System';
  if (type === 'BACKUP_COMPLETED') return 'System';
  if (type.startsWith('SYNC_')) return 'SyncQueue';
  if (type === 'AUDIT_LOG_ENTRY') return 'AuditLog';
  return 'System';
}

async function getCurrentTenantId(): Promise<string> {
  const headerList = await headers();
  let tenantId = headerList.get('x-resolved-tenant-id');

  if (!tenantId && process.env.NODE_ENV === 'development') {
    try {
      const { getControlDb } = await import('@amisimedos/db/client');
      const controlDb = getControlDb();
      const firstTenant = await controlDb.tenant.findFirst();
      if (firstTenant) tenantId = firstTenant.id;
    } catch {
      // Ignore in dev
    }
  }

  if (!tenantId) {
    throw new Error('No tenant context found');
  }

  return tenantId;
}

// ─── Event Store (Persistence + Replay) ─────────────────────────────────

export interface PersistedEventRecord {
  id: string;
  eventType: string;
  domain: string;
  severity: string;
  tenantId: string;
  entityType: string;
  entityId: string;
  patientId: string | null;
  encounterId: string | null;
  visitId: string | null;
  actorId: string | null;
  actorName: string | null;
  actorRole: string | null;
  payload: Record<string, unknown>;
  occurredAt: Date;
  version: number;
  correlationId: string | null;
  causationId: string | null;
  idempotencyKey: string | null;
  sequenceNumber: bigint;
}

export class EventStore {
  private static instance: EventStore;

  static getInstance(): EventStore {
    if (!EventStore.instance) {
      EventStore.instance = new EventStore();
    }
    return EventStore.instance;
  }

  async persist<T extends EventType>(event: SystemEvent): Promise<PersistedEventRecord> {
    const db = await getTenantDb(event.tenantId);

    const result = await db.eventJournal.create({
      data: {
        id: event.id,
        entityType: extractEntityType(event.type),
        entityId: event.entityId,
        action: 'CREATE',
        payload: {
          eventType: event.type,
          domain: event.domain,
          severity: event.severity,
          patientId: event.patientId,
          encounterId: event.encounterId,
          visitId: event.visitId,
          actorId: event.actorId,
          actorName: event.actorName,
          actorRole: event.actorRole,
          correlationId: event.correlationId,
          causationId: event.causationId,
          idempotencyKey: event.idempotencyKey,
          data: event.payload,
        } as any,
        timestamp: event.occurredAt,
        isSynced: false,
        direction: 'OUTGOING',
      },
    });

    return {
      id: result.id,
      eventType: event.type,
      domain: event.domain,
      severity: event.severity,
      tenantId: event.tenantId,
      entityType: result.entityType,
      entityId: result.entityId,
      patientId: event.patientId ?? null,
      encounterId: event.encounterId ?? null,
      visitId: event.visitId ?? null,
      actorId: event.actorId ?? null,
      actorName: event.actorName ?? null,
      actorRole: event.actorRole ?? null,
      payload: event.payload as Record<string, unknown>,
      occurredAt: result.timestamp,
      version: event.version,
      correlationId: event.correlationId ?? null,
      causationId: event.causationId ?? null,
      idempotencyKey: event.idempotencyKey ?? null,
      sequenceNumber: result.sequenceNumber,
    };
  }

  async query(query: EventStoreQuery): Promise<EventStoreResult> {
    const db = await getTenantDb(query.tenantId);

    const where: Record<string, unknown> = {};

    if (query.entityTypes && query.entityTypes.length > 0) {
      where.entityType = { in: query.entityTypes };
    }
    if (query.entityIds && query.entityIds.length > 0) {
      where.entityId = { in: query.entityIds };
    }

    const { where: prismaWhere, orderBy } = this.buildQueryFilters(query);

    const limit = query.limit ?? 100;
    const offset = query.offset ?? 0;

    const [events, totalCount] = await Promise.all([
      db.eventJournal.findMany({
        where: prismaWhere,
        orderBy,
        take: limit,
        skip: offset,
      }),
      db.eventJournal.count({ where: prismaWhere }),
    ]);

    const systemEvents: SystemEvent[] = events.map((e: any) => {
      const payload = e.payload as Record<string, unknown> | null;
      return {
        id: e.id,
        type: (payload?.eventType as EventType) ?? ('AUDIT_LOG_ENTRY' as EventType),
        domain: (payload?.domain as EventDomain) ?? 'SYSTEM',
        severity: (payload?.severity as EventSeverity) ?? 'INFO',
        tenantId: query.tenantId,
        entityType: e.entityType,
        entityId: e.entityId,
        patientId: payload?.patientId as string | undefined,
        encounterId: payload?.encounterId as string | undefined,
        visitId: payload?.visitId as string | undefined,
        actorId: payload?.actorId as string | undefined,
        actorName: payload?.actorName as string | undefined,
        actorRole: payload?.actorRole as string | undefined,
        payload: (payload?.data as Record<string, unknown>) ?? {},
        occurredAt: e.timestamp,
        version: 1,
        correlationId: payload?.correlationId as string | undefined,
        causationId: payload?.causationId as string | undefined,
        idempotencyKey: payload?.idempotencyKey as string | undefined,
      };
    });

    return {
      events: systemEvents,
      totalCount,
      hasMore: offset + limit < totalCount,
      replayCursor: events.length > 0 ? String(events[events.length - 1].sequenceNumber) : undefined,
    };
  }

  async replayFromCursor(
    tenantId: string,
    cursor: string,
    limit: number = 100
  ): Promise<EventStoreResult> {
    const db = await getTenantDb(tenantId);

    const events = await db.eventJournal.findMany({
      where: {
        sequenceNumber: { gt: BigInt(cursor) },
      },
      orderBy: { sequenceNumber: 'asc' },
      take: limit,
    });

    const systemEvents: SystemEvent[] = events.map((e: any) => {
      const payload = e.payload as Record<string, unknown> | null;
      return {
        id: e.id,
        type: (payload?.eventType as EventType) ?? ('AUDIT_LOG_ENTRY' as EventType),
        domain: (payload?.domain as EventDomain) ?? 'SYSTEM',
        severity: (payload?.severity as EventSeverity) ?? 'INFO',
        tenantId,
        entityType: e.entityType,
        entityId: e.entityId,
        patientId: payload?.patientId as string | undefined,
        encounterId: payload?.encounterId as string | undefined,
        visitId: payload?.visitId as string | undefined,
        actorId: payload?.actorId as string | undefined,
        actorName: payload?.actorName as string | undefined,
        actorRole: payload?.actorRole as string | undefined,
        payload: (payload?.data as Record<string, unknown>) ?? {},
        occurredAt: e.timestamp,
        version: 1,
        correlationId: payload?.correlationId as string | undefined,
        causationId: payload?.causationId as string | undefined,
        idempotencyKey: payload?.idempotencyKey as string | undefined,
      };
    });

    const lastSeq = events.length > 0 ? String(events[events.length - 1].sequenceNumber) : cursor;

    return {
      events: systemEvents,
      totalCount: systemEvents.length,
      hasMore: events.length === limit,
      replayCursor: lastSeq,
    };
  }

  async getByCorrelationId(tenantId: string, correlationId: string): Promise<SystemEvent[]> {
    const db = await getTenantDb(tenantId);

    const events = await db.eventJournal.findMany({
      where: {
        payload: {
          path: ['correlationId'],
          string_contains: correlationId,
        },
      },
      orderBy: { timestamp: 'asc' },
    });

    return events.map((e: any) => {
      const payload = e.payload as Record<string, unknown> | null;
      return {
        id: e.id,
        type: (payload?.eventType as EventType) ?? ('AUDIT_LOG_ENTRY' as EventType),
        domain: (payload?.domain as EventDomain) ?? 'SYSTEM',
        severity: (payload?.severity as EventSeverity) ?? 'INFO',
        tenantId,
        entityType: e.entityType,
        entityId: e.entityId,
        patientId: payload?.patientId as string | undefined,
        encounterId: payload?.encounterId as string | undefined,
        visitId: payload?.visitId as string | undefined,
        actorId: payload?.actorId as string | undefined,
        actorName: payload?.actorName as string | undefined,
        actorRole: payload?.actorRole as string | undefined,
        payload: (payload?.data as Record<string, unknown>) ?? {},
        occurredAt: e.timestamp,
        version: 1,
        correlationId: payload?.correlationId as string | undefined,
        causationId: payload?.causationId as string | undefined,
        idempotencyKey: payload?.idempotencyKey as string | undefined,
      };
    });
  }

  async getPatientTimeline(
    tenantId: string,
    patientId: string,
    limit: number = 50
  ): Promise<SystemEvent[]> {
    const db = await getTenantDb(tenantId);

    const events = await db.eventJournal.findMany({
      where: {
        payload: {
          path: ['patientId'],
          string_contains: patientId,
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return events.map((e: any) => {
      const payload = e.payload as Record<string, unknown> | null;
      return {
        id: e.id,
        type: (payload?.eventType as EventType) ?? ('AUDIT_LOG_ENTRY' as EventType),
        domain: (payload?.domain as EventDomain) ?? 'SYSTEM',
        severity: (payload?.severity as EventSeverity) ?? 'INFO',
        tenantId,
        entityType: e.entityType,
        entityId: e.entityId,
        patientId: payload?.patientId as string | undefined,
        encounterId: payload?.encounterId as string | undefined,
        visitId: payload?.visitId as string | undefined,
        actorId: payload?.actorId as string | undefined,
        actorName: payload?.actorName as string | undefined,
        actorRole: payload?.actorRole as string | undefined,
        payload: (payload?.data as Record<string, unknown>) ?? {},
        occurredAt: e.timestamp,
        version: 1,
        correlationId: payload?.correlationId as string | undefined,
        causationId: payload?.causationId as string | undefined,
        idempotencyKey: payload?.idempotencyKey as string | undefined,
      };
    });
  }

  private buildQueryFilters(query: EventStoreQuery): {
    where: Record<string, unknown>;
    orderBy: { sequenceNumber?: 'asc' | 'desc'; timestamp?: 'asc' | 'desc' };
  } {
    const where: Record<string, unknown> = {};
    const orderBy: { sequenceNumber?: 'asc' | 'desc'; timestamp?: 'asc' | 'desc' } = {};

    if (query.types && query.types.length > 0) {
      where.payload = {
        ...(where.payload as Record<string, unknown>),
        path: ['eventType'],
        in: query.types,
      };
    }

    if (query.severities && query.severities.length > 0) {
      where.payload = {
        ...(where.payload as Record<string, unknown>),
        path: ['severity'],
        in: query.severities,
      };
    }

    if (query.fromDate || query.toDate) {
      where.timestamp = {};
      if (query.fromDate) (where.timestamp as Record<string, unknown>).gte = query.fromDate;
      if (query.toDate) (where.timestamp as Record<string, unknown>).lte = query.toDate;
    }

    const orderDir = query.orderDir ?? 'desc';
    if (query.orderBy === 'sequenceNumber') {
      orderBy.sequenceNumber = orderDir;
    } else {
      orderBy.timestamp = orderDir;
    }

    return { where, orderBy };
  }

  async getEventStats(tenantId: string, hours: number = 24): Promise<{
    totalEvents: number;
    byDomain: Array<{ domain: string; count: number }>;
    bySeverity: Array<{ severity: string; count: number }>;
    byHour: Array<{ hour: string; count: number }>;
  }> {
    const db = await getTenantDb(tenantId);
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const events = await db.eventJournal.findMany({
      where: { timestamp: { gte: since } },
      select: {
        payload: true,
        timestamp: true,
      },
      orderBy: { timestamp: 'asc' },
    });

    const byDomain = new Map<string, number>();
    const bySeverity = new Map<string, number>();
    const byHour = new Map<string, number>();

    for (const e of events) {
      const payload = e.payload as Record<string, unknown> | null;
      const domain = (payload?.domain as string) ?? 'SYSTEM';
      const severity = (payload?.severity as string) ?? 'INFO';
      const hour = e.timestamp.toISOString().slice(0, 13);

      byDomain.set(domain, (byDomain.get(domain) ?? 0) + 1);
      bySeverity.set(severity, (bySeverity.get(severity) ?? 0) + 1);
      byHour.set(hour, (byHour.get(hour) ?? 0) + 1);
    }

    return {
      totalEvents: events.length,
      byDomain: Array.from(byDomain.entries()).map(([domain, count]) => ({ domain, count })),
      bySeverity: Array.from(bySeverity.entries()).map(([severity, count]) => ({ severity, count })),
      byHour: Array.from(byHour.entries()).map(([hour, count]) => ({ hour, count })),
    };
  }
}

export const eventStore = EventStore.getInstance();
