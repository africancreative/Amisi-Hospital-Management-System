// ─── Central Event System — Schema & Types ───────────────────────────────
//
// This file defines the complete event vocabulary for AmisiMedOS.
// Every module communicates exclusively through these events.
// Events are persisted in EventJournal for replay and audit.

// ─── Event Domain (Module) ───────────────────────────────────────────────

export type EventDomain =
  | 'PATIENT'
  | 'TRIAGE'
  | 'ENCOUNTER'
  | 'LAB'
  | 'RADIOLOGY'
  | 'PHARMACY'
  | 'BILLING'
  | 'INVENTORY'
  | 'HR'
  | 'ADT'       // Admission, Discharge, Transfer
  | 'ICU'
  | 'SURGERY'
  | 'MATERNITY'
  | 'ONCOLOGY'
  | 'SYSTEM';

// ─── Event Types (Comprehensive) ─────────────────────────────────────────

export type EventType =
  // Patient domain
  | 'PATIENT_REGISTERED'
  | 'PATIENT_UPDATED'
  | 'PATIENT_MERGED'
  | 'PATIENT_DECEASED'
  | 'PATIENT_ARCHIVED'

  // Triage domain
  | 'TRIAGE_STARTED'
  | 'TRIAGE_COMPLETED'
  | 'ESI_LEVEL_ASSIGNED'
  | 'TRIAGE_REASSESSMENT'

  // Encounter domain
  | 'ENCOUNTER_CREATED'
  | 'CONSULTATION_STARTED'
  | 'CONSULTATION_COMPLETED'
  | 'DIAGNOSIS_ADDED'
  | 'CLINICAL_NOTE_ADDED'
  | 'CLINICAL_NOTE_SIGNED'
  | 'ENCOUNTER_CLOSED'
  | 'ENCOUNTER_REOPENED'
  | 'VITALS_RECORDED'
  | 'ALLERGY_ADDED'
  | 'ALLERGY_UPDATED'

  // Lab domain
  | 'LAB_ORDERED'
  | 'LAB_SAMPLE_COLLECTED'
  | 'LAB_SAMPLE_REJECTED'
  | 'LAB_IN_ANALYSIS'
  | 'LAB_RESULT_READY'
  | 'LAB_RESULT_CRITICAL'
  | 'LAB_VALIDATED'
  | 'LAB_REPORT_GENERATED'
  | 'LAB_CANCELLED'

  // Radiology domain
  | 'RADIOLOGY_ORDERED'
  | 'RADIOLOGY_SCHEDULED'
  | 'RADIOLOGY_ACQUIRED'
  | 'RADIOLOGY_REPORTED'
  | 'RADIOLOGY_CRITICAL_RESULT'

  // Pharmacy domain
  | 'PRESCRIPTION_ISSUED'
  | 'PRESCRIPTION_RECEIVED'
  | 'PRESCRIPTION_VERIFIED'
  | 'PRESCRIPTION_DISPENSED'
  | 'PRESCRIPTION_CANCELLED'
  | 'PRESCRIPTION_AMENDED'
  | 'DRUG_INTERACTION_ALERT'
  | 'CONTROLLED_SUBSTANCE_DISPENSED'

  // Billing domain
  | 'BILL_GENERATED'
  | 'BILL_ITEM_ADDED'
  | 'BILL_ITEM_REMOVED'
  | 'PAYMENT_RECORDED'
  | 'PAYMENT_ALLOCATED'
  | 'PAYMENT_REFUNDED'
  | 'BILL_VOIDED'
  | 'INSURANCE_CLAIM_SUBMITTED'
  | 'INSURANCE_CLAIM_APPROVED'
  | 'INSURANCE_CLAIM_REJECTED'
  | 'BILL_PAID_IN_FULL'

  // Inventory domain
  | 'STOCK_RECEIVED'
  | 'STOCK_DISPENSED'
  | 'STOCK_ADJUSTED'
  | 'STOCK_RETURNED'
  | 'STOCK_EXPIRED'
  | 'LOW_STOCK_ALERT'
  | 'OUT_OF_STOCK_ALERT'
  | 'EXPIRY_ALERT'
  | 'STOCK_REORDERED'
  | 'PURCHASE_ORDER_CREATED'
  | 'PURCHASE_ORDER_APPROVED'
  | 'GOODS_RECEIVED'

  // HR domain
  | 'EMPLOYEE_ONBOARDED'
  | 'SHIFT_ASSIGNED'
  | 'SHIFT_SWAPPED'
  | 'CLOCK_IN'
  | 'CLOCK_OUT'
  | 'LEAVE_REQUESTED'
  | 'LEAVE_APPROVED'
  | 'LEAVE_REJECTED'
  | 'PAYSLIP_READY'
  | 'CREDENTIAL_EXPIRING'

  // ADT (Admission, Discharge, Transfer) domain
  | 'PATIENT_ADMITTED'
  | 'PATIENT_TRANSFERRED'
  | 'PATIENT_DISCHARGED'
  | 'BED_ASSIGNED'
  | 'BED_RELEASED'
  | 'BED_STATUS_CHANGED'

  // ICU domain
  | 'ICU_ADMISSION'
  | 'ICU_DISCHARGE'
  | 'VENTILATOR_STARTED'
  | 'VENTILATOR_STOPPED'
  | 'ICU_ALARM'
  | 'APACHE_SCORE_UPDATED'
  | 'MAR_UPDATED'

  // Surgery domain
  | 'SURGERY_REQUESTED'
  | 'SURGERY_SCHEDULED'
  | 'SURGERY_PRE_OP_CLEARED'
  | 'SURGERY_STARTED'
  | 'SURGERY_COMPLETED'
  | 'SURGERY_CANCELLED'
  | 'PACU_ADMISSION'
  | 'PACU_DISCHARGE'

  // Maternity domain
  | 'ANC_BOOKING'
  | 'ANC_VISIT_COMPLETED'
  | 'LABOUR_STARTED'
  | 'DELIVERY_COMPLETE'
  | 'POSTNATAL_CHECK'
  | 'PARTOGRAM_ALERT'
  | 'FOETAL_DISTRESS'
  | 'HIGH_RISK_PREGNANCY'
  | 'NICU_ALERT'

  // Oncology domain
  | 'ONCOLOGY_TREATMENT_STARTED'
  | 'CHEMO_SESSION_STARTED'
  | 'CHEMO_SESSION_COMPLETED'
  | 'CHEMO_HELD'
  | 'ONCOLOGY_EMERGENCY'
  | 'TOXICITY_REPORTED'

  // System domain
  | 'TENANT_CREATED'
  | 'TENANT_SUSPENDED'
  | 'MODULE_ENABLED'
  | 'MODULE_DISABLED'
  | 'SYSTEM_MAINTENANCE'
  | 'BACKUP_COMPLETED'
  | 'SYNC_COMPLETED'
  | 'SYNC_FAILED'
  | 'AUDIT_LOG_ENTRY';

// ─── Event Severity ──────────────────────────────────────────────────────

export type EventSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

// ─── Base Event Schema ───────────────────────────────────────────────────

export interface SystemEvent<T = Record<string, unknown>> {
  id: string;                    // ULID or UUID
  type: EventType;
  domain: EventDomain;
  severity: EventSeverity;
  tenantId: string;

  // Entity being acted upon
  entityType: string;            // e.g., 'Patient', 'LabOrder', 'Invoice'
  entityId: string;

  // Optional related entities
  patientId?: string;
  encounterId?: string;
  visitId?: string;

  // Actor (who triggered the event)
  actorId?: string;
  actorName?: string;
  actorRole?: string;

  // Payload (type-safe based on event type)
  payload: T;

  // Metadata
  occurredAt: Date;
  version: number;               // For event sourcing / replay
  correlationId?: string;        // Links related events (e.g., same patient visit)
  causationId?: string;          // ID of the event that caused this one
  idempotencyKey?: string;       // Prevents duplicate processing
}

// ─── Event Payloads (Type-Safe) ─────────────────────────────────────────

// Patient events
export interface PatientRegisteredPayload {
  patientId: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: Date;
  gender: string;
  phone?: string;
  registeredBy: string;
  registrationMethod: 'WALK_IN' | 'REFERRAL' | 'EMERGENCY' | 'ONLINE';
}

export interface PatientUpdatedPayload {
  patientId: string;
  changedFields: string[];
  previousValues: Record<string, unknown>;
  updatedBy: string;
}

// Triage events
export interface TriageCompletedPayload {
  encounterId: string;
  patientId: string;
  esiLevel: 1 | 2 | 3 | 4 | 5;
  chiefComplaint: string;
  vitals: {
    temperature?: number;
    systolicBP?: number;
    diastolicBP?: number;
    pulse?: number;
    spo2?: number;
    respRate?: number;
  };
  triageNurse: string;
  waitTimeMinutes: number;
}

// Encounter events
export interface ConsultationStartedPayload {
  encounterId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  encounterType: 'OPD' | 'ED' | 'IPD' | 'FOLLOW_UP';
  department: string;
}

export interface ConsultationCompletedPayload {
  encounterId: string;
  patientId: string;
  doctorId: string;
  diagnoses: Array<{ code: string; system: string; description: string; category: string }>;
  prescriptionsIssued: number;
  labOrdersIssued: number;
  referralMade: boolean;
  followUpScheduled: boolean;
  durationMinutes: number;
}

export interface VitalsRecordedPayload {
  encounterId: string;
  patientId: string;
  vitals: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    spO2?: number;
    weight?: number;
    height?: number;
    painScore?: number;
    gcs?: number;
  };
  recordedBy: string;
  news2Score?: number;
}

// Lab events
export interface LabOrderedPayload {
  labOrderId: string;
  patientId: string;
  encounterId?: string;
  testPanelId: string;
  testPanelName: string;
  urgency: 'ROUTINE' | 'STAT' | 'ASAP';
  orderedBy: string;
  clinicalNotes?: string;
  estimatedCost: number;
}

export interface LabResultReadyPayload {
  labOrderId: string;
  patientId: string;
  testPanelId: string;
  results: Array<{
    biomarkerName: string;
    value: string;
    numericValue?: number;
    unit?: string;
    flag: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL_HIGH' | 'CRITICAL_LOW';
    referenceRange?: string;
  }>;
  analyzedBy: string;
  machineId?: string;
}

export interface LabResultCriticalPayload {
  labOrderId: string;
  patientId: string;
  criticalResults: Array<{
    biomarkerName: string;
    value: string;
    flag: 'CRITICAL_HIGH' | 'CRITICAL_LOW';
  }>;
  notifiedTo: string[];
  notificationMethod: 'CALL' | 'SMS' | 'IN_APP' | 'PAGER';
}

// Pharmacy events
export interface PrescriptionIssuedPayload {
  prescriptionId: string;
  patientId: string;
  encounterId?: string;
  doctorId: string;
  doctorName: string;
  items: Array<{
    drugName: string;
    dosage: string;
    frequency: string;
    duration: string;
    quantity: number;
    inventoryItemId?: string;
  }>;
  totalEstimatedCost: number;
  drugInteractionAlerts: Array<{ drugA: string; drugB: string; severity: string }>;
}

export interface PrescriptionDispensedPayload {
  prescriptionId: string;
  patientId: string;
  pharmacistId: string;
  pharmacistName: string;
  items: Array<{
    drugName: string;
    quantity: number;
    batchNumber?: string;
    expiryDate?: Date;
    costPrice?: number;
  }>;
  totalCOGS: number;
  counselingProvided: boolean;
  patientInstructed: boolean;
}

// Billing events
export interface BillGeneratedPayload {
  invoiceId: string;
  patientId: string;
  encounterId?: string;
  visitId?: string;
  items: Array<{
    description: string;
    category: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  currency: string;
  payerType: 'CASH' | 'INSURANCE' | 'CORPORATE';
  generatedBy: string;
  triggerEvent: string;
}

export interface PaymentRecordedPayload {
  paymentId: string;
  invoiceId: string;
  patientId: string;
  amount: number;
  currency: string;
  method: 'CASH' | 'MPESA' | 'CARD' | 'INSURANCE' | 'BANK_TRANSFER';
  reference?: string;
  recordedBy: string;
  remainingBalance: number;
  isFullPayment: boolean;
}

export interface BillPaidInFullPayload {
  invoiceId: string;
  patientId: string;
  totalPaid: number;
  paymentCount: number;
  paymentMethods: string[];
  clearedAt: Date;
  clearedBy: string;
}

// Inventory events
export interface StockDispensedPayload {
  itemId: string;
  itemName: string;
  quantity: number;
  previousQty: number;
  newQty: number;
  prescriptionId?: string;
  patientId?: string;
  patientName?: string;
  dispensedBy: string;
  batchAllocations?: Array<{ batchId: string; batchNumber: string; qty: number }>;
}

export interface LowStockAlertPayload {
  itemId: string;
  itemName: string;
  currentQty: number;
  minLevel: number;
  reorderLevel: number;
  suggestedOrderQty: number;
  vendorId?: string;
  vendorName?: string;
}

export interface StockReceivedPayload {
  itemId: string;
  itemName: string;
  quantity: number;
  previousQty: number;
  newQty: number;
  batchNumber?: string;
  expiryDate?: Date;
  costPrice?: number;
  purchaseOrderId?: string;
  grnId: string;
  receivedBy: string;
}

// ADT events
export interface PatientAdmittedPayload {
  admissionId: string;
  patientId: string;
  encounterId: string;
  bedId: string;
  wardName: string;
  bedNumber: string;
  attendingPhysicianId: string;
  admissionReason: string;
  admittedBy: string;
}

export interface PatientDischargedPayload {
  patientId: string;
  encounterId: string;
  admissionId: string;
  dischargeType: 'NORMAL' | 'AMA' | 'TRANSFER' | 'DECEASED';
  dischargeSummary?: string;
  followUpRequired: boolean;
  dischargeMedications: Array<{ drugName: string; dosage: string; duration: string }>;
  dischargedBy: string;
}

// System events
export interface ModuleEnabledPayload {
  moduleId: string;
  moduleName: string;
  enabledBy: string;
  previousState: boolean;
  newState: true;
}

export interface SyncCompletedPayload {
  syncId: string;
  direction: 'OUTGOING' | 'INCOMING';
  recordsSynced: number;
  durationMs: number;
  lastSequenceNumber: bigint;
  errors: number;
}

// ─── Event Type → Payload Mapping ────────────────────────────────────────

export type EventPayloadMap = {
  PATIENT_REGISTERED: PatientRegisteredPayload;
  PATIENT_UPDATED: PatientUpdatedPayload;
  TRIAGE_COMPLETED: TriageCompletedPayload;
  CONSULTATION_STARTED: ConsultationStartedPayload;
  CONSULTATION_COMPLETED: ConsultationCompletedPayload;
  VITALS_RECORDED: VitalsRecordedPayload;
  LAB_ORDERED: LabOrderedPayload;
  LAB_RESULT_READY: LabResultReadyPayload;
  LAB_RESULT_CRITICAL: LabResultCriticalPayload;
  PRESCRIPTION_ISSUED: PrescriptionIssuedPayload;
  PRESCRIPTION_DISPENSED: PrescriptionDispensedPayload;
  BILL_GENERATED: BillGeneratedPayload;
  PAYMENT_RECORDED: PaymentRecordedPayload;
  BILL_PAID_IN_FULL: BillPaidInFullPayload;
  STOCK_DISPENSED: StockDispensedPayload;
  LOW_STOCK_ALERT: LowStockAlertPayload;
  STOCK_RECEIVED: StockReceivedPayload;
  PATIENT_ADMITTED: PatientAdmittedPayload;
  PATIENT_DISCHARGED: PatientDischargedPayload;
  MODULE_ENABLED: ModuleEnabledPayload;
  SYNC_COMPLETED: SyncCompletedPayload;
};

// ─── Subscription Filter ─────────────────────────────────────────────────

export interface EventSubscriptionFilter {
  types?: EventType[];
  domains?: EventDomain[];
  severities?: EventSeverity[];
  entityTypes?: string[];
  actorIds?: string[];
  patientIds?: string[];
  encounterIds?: string[];
}

// ─── Event Subscription ──────────────────────────────────────────────────

export interface EventSubscription {
  id: string;
  module: string;            // Module name (e.g., 'billing', 'pharmacy')
  filter: EventSubscriptionFilter;
  handler: (event: SystemEvent) => void | Promise<void>;
  onError?: (event: SystemEvent, error: Error) => void;
  createdAt: Date;
}

// ─── Event Store Query ───────────────────────────────────────────────────

export interface EventStoreQuery {
  tenantId: string;
  types?: EventType[];
  domains?: EventDomain[];
  entityTypes?: string[];
  entityIds?: string[];
  patientIds?: string[];
  actorIds?: string[];
  correlationIds?: string[];
  severities?: EventSeverity[];
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
  orderBy?: 'occurredAt' | 'id' | 'sequenceNumber';
  orderDir?: 'asc' | 'desc';
}

export interface EventStoreResult {
  events: SystemEvent[];
  totalCount: number;
  hasMore: boolean;
  replayCursor?: string;
}
