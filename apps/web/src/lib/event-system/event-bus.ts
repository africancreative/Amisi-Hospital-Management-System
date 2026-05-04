import {
  SystemEvent,
  EventType,
  EventDomain,
  EventSeverity,
  EventSubscription,
  EventSubscriptionFilter,
  EventPayloadMap,
} from './types';
import { eventStore } from './event-store';
import { realtimeHub, RealtimeEventType } from '@amisimedos/chat';

const REALTIME_EVENT_TYPES = new Set<string>([
  'PATIENT_MUTATED', 'VITALS_UPDATED', 'MEDICATION_DISPENSED', 'LAB_RESULT_READY',
  'ADMISSION_UPDATED', 'INVENTORY_ALERT', 'LAB_ORDERED', 'SPECIMEN_COLLECTED',
  'RESULTS_INGESTED', 'LAB_REPORT_VALIDATED', 'CRITICAL_LAB_ALERT', 'PATIENT_ADMITTED',
  'PATIENT_TRANSFERRED', 'PATIENT_DISCHARGED', 'PO_SENT', 'PO_APPROVAL_REQUIRED',
  'INVENTORY_RESTOCKED', 'INVENTORY_DISPENSED', 'DIAGNOSTIC_ORDERED', 'CRITICAL_RESULT_ALARM',
  'TRAUMA_ALARM', 'ROI_REQUESTED', 'ROI_APPROVED', 'EMPLOYEE_ONBOARDED',
  'SHIFT_ASSIGNED', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'ICU_ADMISSION',
  'VENTILATOR_UPDATED', 'ICU_DISCHARGE', 'BED_STATUS_CHANGED', 'MAR_UPDATED',
  'PRESCRIPTION_RECEIVED', 'PRESCRIPTION_DISPENSED', 'CONTROLLED_SUBSTANCE_DISPENSED',
  'RADIOLOGY_ORDERED', 'STUDY_ACQUIRED', 'SURGERY_REQUESTED', 'SURGERY_SCHEDULED',
  'ICU_ADMISSION_PENDING', 'TREATMENT_CREATED', 'CHEMO_STARTED', 'PAYSLIP_READY',
  'STOCK_DISPENSED', 'LOW_STOCK_ALERT', 'OUT_OF_STOCK_ALERT', 'PAYMENT_RECEIVED',
  'ICU_ALARM', 'HIGH_RISK_PREGNANCY', 'LABOUR_STARTED', 'PARTOGRAM_ALERT',
  'FOETAL_DISTRESS', 'DELIVERY_COMPLETE', 'NICU_ALERT', 'MASSIVE_TRANSFUSION_ALERT',
  'CHEMO_HELD', 'ONCOLOGY_EMERGENCY', 'CRITICAL_RESULT_ALERT', 'CREDENTIAL_EXPIRY_ALERT',
  'QUEUE_UPDATED', 'CHAT_MESSAGE_RECEIVED',
]);

// ─── EventBus — Central Pub/Sub + Persistence + Broadcast ────────────────

class EventBus {
  private static instance: EventBus;
  private subscriptions = new Map<string, EventSubscription>();
  private idempotencyCache = new Map<string, number>();
  private readonly IDEMPOTENCY_TTL_MS = 5 * 60 * 1000;

  private constructor() {}

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  async publish(
    event: { type: EventType; tenantId: string; id: string; entityType: string; entityId: string; payload?: Record<string, unknown>; patientId?: string; encounterId?: string; visitId?: string; actorId?: string; actorName?: string; actorRole?: string; correlationId?: string; causationId?: string; idempotencyKey?: string; occurredAt?: Date; version?: number }
  ): Promise<SystemEvent> {
    const fullEvent: SystemEvent = {
      ...event,
      domain: this.inferDomain(event.type),
      severity: this.inferSeverity(event.type),
      occurredAt: event.occurredAt ?? new Date(),
      version: event.version ?? 1,
      payload: (event.payload ?? {}) as Record<string, unknown>,
    };

    if (fullEvent.idempotencyKey) {
      const cached = this.idempotencyCache.get(fullEvent.idempotencyKey);
      if (cached && Date.now() - cached < this.IDEMPOTENCY_TTL_MS) {
        console.log(`[EventBus] Duplicate event skipped: ${fullEvent.idempotencyKey}`);
        return fullEvent;
      }
      this.idempotencyCache.set(fullEvent.idempotencyKey, Date.now());
      this.cleanupIdempotencyCache();
    }

    try {
      await eventStore.persist(fullEvent);
    } catch (err) {
      console.error(`[EventBus] Failed to persist event ${fullEvent.id}:`, err);
    }

    try {
      if (REALTIME_EVENT_TYPES.has(fullEvent.type)) {
        realtimeHub.broadcast(
          fullEvent.tenantId,
          fullEvent.type as RealtimeEventType,
          fullEvent.entityType,
          fullEvent.entityId,
          {
            ...fullEvent.payload,
            _meta: {
              domain: fullEvent.domain,
              severity: fullEvent.severity,
              actorId: fullEvent.actorId,
              actorName: fullEvent.actorName,
              patientId: fullEvent.patientId,
              encounterId: fullEvent.encounterId,
              correlationId: fullEvent.correlationId,
              occurredAt: fullEvent.occurredAt.toISOString(),
            },
          }
        );
      }
    } catch (err) {
      console.error(`[EventBus] Failed to broadcast event ${fullEvent.id}:`, err);
    }

    this.dispatch(fullEvent);

    console.log(`[EventBus] Published: ${fullEvent.type} (${fullEvent.entityType}:${fullEvent.entityId})`);

    return fullEvent;
  }

  subscribe(
    module: string,
    filter: EventSubscriptionFilter,
    handler: (event: SystemEvent) => void | Promise<void>,
    onError?: (event: SystemEvent, error: Error) => void
  ): string {
    const id = `sub-${module}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    this.subscriptions.set(id, {
      id,
      module,
      filter,
      handler,
      onError,
      createdAt: new Date(),
    });

    console.log(`[EventBus] ${module} subscribed: ${filter.types?.join(', ') ?? 'all events'}`);
    return id;
  }

  unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
  }

  getSubscriptions(module?: string): EventSubscription[] {
    if (module) {
      return Array.from(this.subscriptions.values()).filter((s: any) => s.module === module);
    }
    return Array.from(this.subscriptions.values());
  }

  private dispatch(event: SystemEvent): void {
    for (const [, sub] of this.subscriptions) {
      if (this.matchesFilter(event, sub.filter)) {
        Promise.resolve(sub.handler(event)).catch((error) => {
          console.error(`[EventBus] Handler error in ${sub.module}:`, error);
          sub.onError?.(event, error);
        });
      }
    }
  }

  private matchesFilter(event: SystemEvent, filter: EventSubscriptionFilter): boolean {
    if (filter.types && filter.types.length > 0 && !filter.types.includes(event.type)) return false;
    if (filter.domains && filter.domains.length > 0 && !filter.domains.includes(event.domain)) return false;
    if (filter.severities && filter.severities.length > 0 && !filter.severities.includes(event.severity)) return false;
    if (filter.entityTypes && filter.entityTypes.length > 0 && !filter.entityTypes.includes(event.entityType)) return false;
    if (filter.actorIds && filter.actorIds.length > 0 && event.actorId && !filter.actorIds.includes(event.actorId)) return false;
    if (filter.patientIds && filter.patientIds.length > 0 && event.patientId && !filter.patientIds.includes(event.patientId)) return false;
    if (filter.encounterIds && filter.encounterIds.length > 0 && event.encounterId && !filter.encounterIds.includes(event.encounterId)) return false;
    return true;
  }

  private inferDomain(type: EventType): EventDomain {
    if (type.startsWith('PATIENT_')) return 'PATIENT';
    if (type.startsWith('TRIAGE_') || type === 'ESI_LEVEL_ASSIGNED') return 'TRIAGE';
    if (
      type.startsWith('ENCOUNTER_') || type.startsWith('CONSULTATION_') ||
      type === 'DIAGNOSIS_ADDED' || type.startsWith('CLINICAL_NOTE_') ||
      type === 'VITALS_RECORDED' || type.startsWith('ALLERGY_')
    ) return 'ENCOUNTER';
    if (type.startsWith('LAB_')) return 'LAB';
    if (type.startsWith('RADIOLOGY_')) return 'RADIOLOGY';
    if (type.startsWith('PRESCRIPTION_') || type === 'DRUG_INTERACTION_ALERT' || type === 'CONTROLLED_SUBSTANCE_DISPENSED') return 'PHARMACY';
    if (type.startsWith('BILL_') || type.startsWith('PAYMENT_') || type.startsWith('INSURANCE_')) return 'BILLING';
    if (type.startsWith('STOCK_') || type.startsWith('PURCHASE_ORDER_') || type === 'LOW_STOCK_ALERT' || type === 'OUT_OF_STOCK_ALERT' || type === 'EXPIRY_ALERT' || type === 'GOODS_RECEIVED') return 'INVENTORY';
    if (type.startsWith('EMPLOYEE_') || type.startsWith('SHIFT_') || type.startsWith('CLOCK_') || type.startsWith('LEAVE_') || type === 'PAYSLIP_READY' || type === 'CREDENTIAL_EXPIRING') return 'HR';
    if (type.includes('PATIENT_ADMITTED') || type.includes('PATIENT_TRANSFERRED') || type.includes('PATIENT_DISCHARGED') || type.startsWith('BED_')) return 'ADT';
    if (type.startsWith('ICU_') || type === 'APACHE_SCORE_UPDATED' || type === 'MAR_UPDATED') return 'ICU';
    if (type.startsWith('SURGERY_') || type.startsWith('PACU_')) return 'SURGERY';
    if (type.startsWith('ANC_') || type.startsWith('LABOUR_') || type.startsWith('DELIVERY_') || type.startsWith('POSTNATAL_') || type === 'PARTOGRAM_ALERT' || type === 'FOETAL_DISTRESS' || type === 'HIGH_RISK_PREGNANCY' || type === 'NICU_ALERT') return 'MATERNITY';
    if (type.startsWith('ONCOLOGY_') || type.startsWith('CHEMO_') || type === 'TOXICITY_REPORTED') return 'ONCOLOGY';
    return 'SYSTEM';
  }

  private inferSeverity(type: EventType): EventSeverity {
    if (type.includes('CRITICAL') || type.includes('EMERGENCY') || type === 'OUT_OF_STOCK_ALERT' || type === 'DRUG_INTERACTION_ALERT' || type === 'FOETAL_DISTRESS' || type === 'ONCOLOGY_EMERGENCY' || type === 'ICU_ALARM' || type === 'SYNC_FAILED') return 'CRITICAL';
    if (type.includes('ALERT') || type.includes('REJECTED') || type === 'LOW_STOCK_ALERT' || type === 'EXPIRY_ALERT' || type === 'CREDENTIAL_EXPIRING' || type === 'LAB_SAMPLE_REJECTED') return 'WARNING';
    if (type.includes('CANCELLED') || type.includes('FAILED')) return 'ERROR';
    return 'INFO';
  }

  private cleanupIdempotencyCache(): void {
    const now = Date.now();
    for (const [key, ts] of this.idempotencyCache.entries()) {
      if (now - ts > this.IDEMPOTENCY_TTL_MS) {
        this.idempotencyCache.delete(key);
      }
    }
  }

  async publishPatientRegistered(data: { tenantId: string; id: string; actorId?: string; actorName?: string; payload: EventPayloadMap['PATIENT_REGISTERED'] }) {
    return this.publish({
      ...data,
      type: 'PATIENT_REGISTERED',
      entityType: 'Patient',
      entityId: data.payload.patientId,
      patientId: data.payload.patientId,
      payload: data.payload as unknown as Record<string, unknown>,
    });
  }

  async publishTriageCompleted(data: { tenantId: string; id: string; actorId?: string; actorName?: string; payload: EventPayloadMap['TRIAGE_COMPLETED'] }) {
    return this.publish({
      ...data,
      type: 'TRIAGE_COMPLETED',
      entityType: 'Encounter',
      entityId: data.payload.encounterId,
      encounterId: data.payload.encounterId,
      patientId: data.payload.patientId,
      payload: data.payload as unknown as Record<string, unknown>,
    });
  }

  async publishConsultationStarted(data: { tenantId: string; id: string; actorId?: string; actorName?: string; payload: EventPayloadMap['CONSULTATION_STARTED'] }) {
    return this.publish({
      ...data,
      type: 'CONSULTATION_STARTED',
      entityType: 'Encounter',
      entityId: data.payload.encounterId,
      encounterId: data.payload.encounterId,
      patientId: data.payload.patientId,
      payload: data.payload as unknown as Record<string, unknown>,
    });
  }

  async publishConsultationCompleted(data: { tenantId: string; id: string; actorId?: string; actorName?: string; payload: EventPayloadMap['CONSULTATION_COMPLETED'] }) {
    return this.publish({
      ...data,
      type: 'CONSULTATION_COMPLETED',
      entityType: 'Encounter',
      entityId: data.payload.encounterId,
      encounterId: data.payload.encounterId,
      patientId: data.payload.patientId,
      payload: data.payload as unknown as Record<string, unknown>,
    });
  }

  async publishLabOrdered(data: { tenantId: string; id: string; actorId?: string; actorName?: string; payload: EventPayloadMap['LAB_ORDERED'] }) {
    return this.publish({
      ...data,
      type: 'LAB_ORDERED',
      entityType: 'LabOrder',
      entityId: data.payload.labOrderId,
      encounterId: data.payload.encounterId,
      patientId: data.payload.patientId,
      payload: data.payload as unknown as Record<string, unknown>,
    });
  }

  async publishPrescriptionIssued(data: { tenantId: string; id: string; actorId?: string; actorName?: string; payload: EventPayloadMap['PRESCRIPTION_ISSUED'] }) {
    return this.publish({
      ...data,
      type: 'PRESCRIPTION_ISSUED',
      entityType: 'Prescription',
      entityId: data.payload.prescriptionId,
      encounterId: data.payload.encounterId,
      patientId: data.payload.patientId,
      payload: data.payload as unknown as Record<string, unknown>,
    });
  }

  async publishPrescriptionDispensed(data: { tenantId: string; id: string; actorId?: string; actorName?: string; payload: EventPayloadMap['PRESCRIPTION_DISPENSED'] }) {
    return this.publish({
      ...data,
      type: 'PRESCRIPTION_DISPENSED',
      entityType: 'Prescription',
      entityId: data.payload.prescriptionId,
      patientId: data.payload.patientId,
      payload: data.payload as unknown as Record<string, unknown>,
    });
  }

  async publishBillGenerated(data: { tenantId: string; id: string; actorId?: string; actorName?: string; payload: EventPayloadMap['BILL_GENERATED'] }) {
    return this.publish({
      ...data,
      type: 'BILL_GENERATED',
      entityType: 'Invoice',
      entityId: data.payload.invoiceId,
      encounterId: data.payload.encounterId,
      visitId: data.payload.visitId,
      patientId: data.payload.patientId,
      payload: data.payload as unknown as Record<string, unknown>,
    });
  }

  async publishPaymentRecorded(data: { tenantId: string; id: string; actorId?: string; actorName?: string; payload: EventPayloadMap['PAYMENT_RECORDED'] }) {
    return this.publish({
      ...data,
      type: 'PAYMENT_RECORDED',
      entityType: 'Payment',
      entityId: data.payload.paymentId,
      patientId: data.payload.patientId,
      payload: data.payload as unknown as Record<string, unknown>,
    });
  }

  async publishBillPaidInFull(data: { tenantId: string; id: string; actorId?: string; actorName?: string; payload: EventPayloadMap['BILL_PAID_IN_FULL'] }) {
    return this.publish({
      ...data,
      type: 'BILL_PAID_IN_FULL',
      entityType: 'Invoice',
      entityId: data.payload.invoiceId,
      patientId: data.payload.patientId,
      payload: data.payload as unknown as Record<string, unknown>,
    });
  }

  async publishStockDispensed(data: { tenantId: string; id: string; actorId?: string; actorName?: string; payload: EventPayloadMap['STOCK_DISPENSED'] }) {
    return this.publish({
      ...data,
      type: 'STOCK_DISPENSED',
      entityType: 'InventoryItem',
      entityId: data.payload.itemId,
      patientId: data.payload.patientId,
      payload: data.payload as unknown as Record<string, unknown>,
    });
  }

  async publishLowStockAlert(data: { tenantId: string; id: string; actorId?: string; actorName?: string; payload: EventPayloadMap['LOW_STOCK_ALERT'] }) {
    return this.publish({
      ...data,
      type: 'LOW_STOCK_ALERT',
      entityType: 'StockAlert',
      entityId: data.payload.itemId,
      payload: data.payload as unknown as Record<string, unknown>,
    });
  }

  async publishStockReceived(data: { tenantId: string; id: string; actorId?: string; actorName?: string; payload: EventPayloadMap['STOCK_RECEIVED'] }) {
    return this.publish({
      ...data,
      type: 'STOCK_RECEIVED',
      entityType: 'InventoryItem',
      entityId: data.payload.itemId,
      payload: data.payload as unknown as Record<string, unknown>,
    });
  }

  async publishPatientAdmitted(data: { tenantId: string; id: string; actorId?: string; actorName?: string; payload: EventPayloadMap['PATIENT_ADMITTED'] }) {
    return this.publish({
      ...data,
      type: 'PATIENT_ADMITTED',
      entityType: 'Admission',
      entityId: data.payload.admissionId,
      encounterId: data.payload.encounterId,
      patientId: data.payload.patientId,
      payload: data.payload as unknown as Record<string, unknown>,
    });
  }

  async publishPatientDischarged(data: { tenantId: string; id: string; actorId?: string; actorName?: string; payload: EventPayloadMap['PATIENT_DISCHARGED'] }) {
    return this.publish({
      ...data,
      type: 'PATIENT_DISCHARGED',
      entityType: 'Admission',
      entityId: data.payload.admissionId,
      encounterId: data.payload.encounterId,
      patientId: data.payload.patientId,
      payload: data.payload as unknown as Record<string, unknown>,
    });
  }
}

export const eventBus = EventBus.getInstance();
export type { SystemEvent, EventType, EventDomain, EventSeverity, EventSubscription, EventSubscriptionFilter, EventPayloadMap } from './types';
