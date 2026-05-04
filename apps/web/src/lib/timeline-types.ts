/**
 * Unified Medical Record Timeline — Type Definitions
 * 
 * Every patient action becomes a timeline event. Events are immutable,
 * append-only entries that form a complete chronological history.
 */

// ─── Event Categories ───────────────────────────────────────────────────
export const EVENT_CATEGORY = {
    CONSULTATION: 'CONSULTATION',
    PRESCRIPTION: 'PRESCRIPTION',
    LAB: 'LAB',
    RADIOLOGY: 'RADIOLOGY',
    CHAT: 'CHAT',
    QUEUE: 'QUEUE',
    VITALS: 'VITALS',
    ADMISSION: 'ADMISSION',
    DISCHARGE: 'DISCHARGE',
    ALLERGY: 'ALLERGY',
    DIAGNOSIS: 'DIAGNOSIS',
    NOTE: 'NOTE',
    SURGERY: 'SURGERY',
    MATERNITY: 'MATERNITY',
    ICU: 'ICU',
    BILLING: 'BILLING',
    SYSTEM: 'SYSTEM',
} as const;

export type EventCategory = (typeof EVENT_CATEGORY)[keyof typeof EVENT_CATEGORY];

// ─── Event Types (granular) ─────────────────────────────────────────────
export const EVENT_TYPE = {
    // Consultations
    CONSULTATION_STARTED: 'CONSULTATION_STARTED',
    CONSULTATION_COMPLETED: 'CONSULTATION_COMPLETED',
    SOAP_NOTE_CREATED: 'SOAP_NOTE_CREATED',
    PROGRESS_NOTE_ADDED: 'PROGRESS_NOTE_ADDED',
    NURSING_NOTE_ADDED: 'NURSING_NOTE_ADDED',
    DISCHARGE_NOTE_CREATED: 'DISCHARGE_NOTE_CREATED',

    // Prescriptions
    PRESCRIPTION_CREATED: 'PRESCRIPTION_CREATED',
    PRESCRIPTION_ITEM_ADDED: 'PRESCRIPTION_ITEM_ADDED',
    PRESCRIPTION_DISPENSED: 'PRESCRIPTION_DISPENSED',
    PRESCRIPTION_CANCELLED: 'PRESCRIPTION_CANCELLED',

    // Lab
    LAB_ORDERED: 'LAB_ORDERED',
    LAB_SAMPLE_COLLECTED: 'LAB_SAMPLE_COLLECTED',
    LAB_RESULT_READY: 'LAB_RESULT_READY',
    LAB_RESULT_CRITICAL: 'LAB_RESULT_CRITICAL',
    LAB_REPORT_FINALIZED: 'LAB_REPORT_FINALIZED',

    // Radiology
    RADIOLOGY_ORDERED: 'RADIOLOGY_ORDERED',
    RADIOLOGY_COMPLETED: 'RADIOLOGY_COMPLETED',
    RADIOLOGY_REPORT_FINALIZED: 'RADIOLOGY_REPORT_FINALIZED',

    // Chat
    CHAT_MESSAGE_SENT: 'CHAT_MESSAGE_SENT',
    CHAT_LAB_RESULT_SHARED: 'CHAT_LAB_RESULT_SHARED',
    CHAT_CLINICAL_NOTE_SHARED: 'CHAT_CLINICAL_NOTE_SHARED',
    CHAT_IMAGE_SHARED: 'CHAT_IMAGE_SHARED',

    // Queue
    QUEUE_REGISTERED: 'QUEUE_REGISTERED',
    QUEUE_CHECKED_IN: 'QUEUE_CHECKED_IN',
    QUEUE_TRIAGED: 'QUEUE_TRIAGED',
    QUEUE_IN_CONSULTATION: 'QUEUE_IN_CONSULTATION',
    QUEUE_TRANSFERRED: 'QUEUE_TRANSFERRED',
    QUEUE_COMPLETED: 'QUEUE_COMPLETED',
    QUEUE_PRIORITY_CHANGED: 'QUEUE_PRIORITY_CHANGED',

    // Vitals
    VITALS_RECORDED: 'VITALS_RECORDED',
    VITALS_CRITICAL_ALERT: 'VITALS_CRITICAL_ALERT',

    // Admission/Discharge
    ADMISSION_CREATED: 'ADMISSION_CREATED',
    ADMISSION_TRANSFERRED: 'ADMISSION_TRANSFERRED',
    DISCHARGE_COMPLETED: 'DISCHARGE_COMPLETED',

    // Allergy
    ALLERGY_ADDED: 'ALLERGY_ADDED',
    ALLERGY_UPDATED: 'ALLERGY_UPDATED',

    // Diagnosis
    DIAGNOSIS_ADDED: 'DIAGNOSIS_ADDED',
    DIAGNOSIS_UPDATED: 'DIAGNOSIS_UPDATED',

    // Surgery
    SURGERY_SCHEDULED: 'SURGERY_SCHEDULED',
    SURGERY_STARTED: 'SURGERY_STARTED',
    SURGERY_COMPLETED: 'SURGERY_COMPLETED',

    // Maternity
    MATERNITY_VISIT: 'MATERNITY_VISIT',
    DELIVERY_RECORDED: 'DELIVERY_RECORDED',

    // ICU
    ICU_ADMISSION: 'ICU_ADMISSION',
    ICU_VITALS_LOG: 'ICU_VITALS_LOG',
    ICU_DISCHARGE: 'ICU_DISCHARGE',

    // Billing
    INVOICE_CREATED: 'INVOICE_CREATED',
    PAYMENT_POSTED: 'PAYMENT_POSTED',
    BILLING_ADJUSTMENT: 'BILLING_ADJUSTMENT',

    // System
    PATIENT_CREATED: 'PATIENT_CREATED',
    PATIENT_UPDATED: 'PATIENT_UPDATED',
    CONSENT_SIGNED: 'CONSENT_SIGNED',
} as const;

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];

// ─── Category-to-Type Mapping ───────────────────────────────────────────
export const CATEGORY_EVENT_TYPES: Record<EventCategory, EventType[]> = {
    CONSULTATION: [
        EVENT_TYPE.CONSULTATION_STARTED,
        EVENT_TYPE.CONSULTATION_COMPLETED,
        EVENT_TYPE.SOAP_NOTE_CREATED,
        EVENT_TYPE.PROGRESS_NOTE_ADDED,
        EVENT_TYPE.NURSING_NOTE_ADDED,
        EVENT_TYPE.DISCHARGE_NOTE_CREATED,
    ],
    PRESCRIPTION: [
        EVENT_TYPE.PRESCRIPTION_CREATED,
        EVENT_TYPE.PRESCRIPTION_ITEM_ADDED,
        EVENT_TYPE.PRESCRIPTION_DISPENSED,
        EVENT_TYPE.PRESCRIPTION_CANCELLED,
    ],
    LAB: [
        EVENT_TYPE.LAB_ORDERED,
        EVENT_TYPE.LAB_SAMPLE_COLLECTED,
        EVENT_TYPE.LAB_RESULT_READY,
        EVENT_TYPE.LAB_RESULT_CRITICAL,
        EVENT_TYPE.LAB_REPORT_FINALIZED,
    ],
    RADIOLOGY: [
        EVENT_TYPE.RADIOLOGY_ORDERED,
        EVENT_TYPE.RADIOLOGY_COMPLETED,
        EVENT_TYPE.RADIOLOGY_REPORT_FINALIZED,
    ],
    CHAT: [
        EVENT_TYPE.CHAT_MESSAGE_SENT,
        EVENT_TYPE.CHAT_LAB_RESULT_SHARED,
        EVENT_TYPE.CHAT_CLINICAL_NOTE_SHARED,
        EVENT_TYPE.CHAT_IMAGE_SHARED,
    ],
    QUEUE: [
        EVENT_TYPE.QUEUE_REGISTERED,
        EVENT_TYPE.QUEUE_CHECKED_IN,
        EVENT_TYPE.QUEUE_TRIAGED,
        EVENT_TYPE.QUEUE_IN_CONSULTATION,
        EVENT_TYPE.QUEUE_TRANSFERRED,
        EVENT_TYPE.QUEUE_COMPLETED,
        EVENT_TYPE.QUEUE_PRIORITY_CHANGED,
    ],
    VITALS: [
        EVENT_TYPE.VITALS_RECORDED,
        EVENT_TYPE.VITALS_CRITICAL_ALERT,
    ],
    ADMISSION: [
        EVENT_TYPE.ADMISSION_CREATED,
        EVENT_TYPE.ADMISSION_TRANSFERRED,
    ],
    DISCHARGE: [
        EVENT_TYPE.DISCHARGE_COMPLETED,
        EVENT_TYPE.DISCHARGE_NOTE_CREATED,
    ],
    ALLERGY: [
        EVENT_TYPE.ALLERGY_ADDED,
        EVENT_TYPE.ALLERGY_UPDATED,
    ],
    DIAGNOSIS: [
        EVENT_TYPE.DIAGNOSIS_ADDED,
        EVENT_TYPE.DIAGNOSIS_UPDATED,
    ],
    NOTE: [
        EVENT_TYPE.SOAP_NOTE_CREATED,
        EVENT_TYPE.PROGRESS_NOTE_ADDED,
        EVENT_TYPE.NURSING_NOTE_ADDED,
        EVENT_TYPE.DISCHARGE_NOTE_CREATED,
    ],
    SURGERY: [
        EVENT_TYPE.SURGERY_SCHEDULED,
        EVENT_TYPE.SURGERY_STARTED,
        EVENT_TYPE.SURGERY_COMPLETED,
    ],
    MATERNITY: [
        EVENT_TYPE.MATERNITY_VISIT,
        EVENT_TYPE.DELIVERY_RECORDED,
    ],
    ICU: [
        EVENT_TYPE.ICU_ADMISSION,
        EVENT_TYPE.ICU_VITALS_LOG,
        EVENT_TYPE.ICU_DISCHARGE,
    ],
    BILLING: [
        EVENT_TYPE.INVOICE_CREATED,
        EVENT_TYPE.PAYMENT_POSTED,
        EVENT_TYPE.BILLING_ADJUSTMENT,
    ],
    SYSTEM: [
        EVENT_TYPE.PATIENT_CREATED,
        EVENT_TYPE.PATIENT_UPDATED,
        EVENT_TYPE.CONSENT_SIGNED,
    ],
};

// ─── Timeline Event Schema ──────────────────────────────────────────────
export interface TimelineEvent {
    id: string;
    patientId: string;
    eventType: EventType;
    category: EventCategory;
    title: string;
    description: string | null;
    visitId?: string | null;
    encounterId?: string | null;
    clinicalNoteId?: string | null;
    actorId: string | null;
    actorName: string | null;
    actorRole: string | null;
    occurredAt: Date;
}

// ─── Event Payloads (for creation) ──────────────────────────────────────
export interface TimelineEventPayload {
    eventType: EventType;
    title: string;
    description: string;
    patientId: string;
    visitId?: string;
    encounterId?: string;
    actorId: string;
    actorName: string;
    actorRole: string;
    metadata?: Record<string, unknown>;
    relatedResourceType?: string;
    relatedResourceId?: string;
    isCritical?: boolean;
    tags?: string[];
}

// ─── Filter Options ─────────────────────────────────────────────────────
export interface TimelineFilters {
    categories?: EventCategory[];
    eventTypes?: EventType[];
    visitId?: string;
    encounterId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    actorId?: string;
    actorRole?: string;
    department?: string;
    searchQuery?: string;
}

// ─── Timeline Group (for date grouping) ─────────────────────────────────
export interface TimelineGroup {
    date: string;
    label: string;
    events: TimelineEvent[];
}

// ─── Event Type Config (UI metadata) ────────────────────────────────────
export interface EventTypeConfig {
    icon: string;
    color: string;
    bgColor: string;
    borderColor: string;
    label: string;
}

export const EVENT_TYPE_CONFIG: Record<EventCategory, EventTypeConfig> = {
    CONSULTATION: {
        icon: 'Stethoscope',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        label: 'Consultation',
    },
    PRESCRIPTION: {
        icon: 'Pill',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        label: 'Prescription',
    },
    LAB: {
        icon: 'FlaskConical',
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
        label: 'Laboratory',
    },
    RADIOLOGY: {
        icon: 'Scan',
        color: 'text-violet-400',
        bgColor: 'bg-violet-500/10',
        borderColor: 'border-violet-500/20',
        label: 'Radiology',
    },
    CHAT: {
        icon: 'MessageSquare',
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/20',
        label: 'Communication',
    },
    QUEUE: {
        icon: 'ListOrdered',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
        label: 'Queue Movement',
    },
    VITALS: {
        icon: 'Heart',
        color: 'text-rose-400',
        bgColor: 'bg-rose-500/10',
        borderColor: 'border-rose-500/20',
        label: 'Vitals',
    },
    ADMISSION: {
        icon: 'CircleArrowRight',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        label: 'Admission',
    },
    DISCHARGE: {
        icon: 'CircleArrowLeft',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20',
        label: 'Discharge',
    },
    ALLERGY: {
        icon: 'AlertTriangle',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20',
        label: 'Allergy',
    },
    DIAGNOSIS: {
        icon: 'ClipboardList',
        color: 'text-teal-400',
        bgColor: 'bg-teal-500/10',
        borderColor: 'border-teal-500/20',
        label: 'Diagnosis',
    },
    NOTE: {
        icon: 'FileText',
        color: 'text-sky-400',
        bgColor: 'bg-sky-500/10',
        borderColor: 'border-sky-500/20',
        label: 'Clinical Note',
    },
    SURGERY: {
        icon: 'Scissors',
        color: 'text-indigo-400',
        bgColor: 'bg-indigo-500/10',
        borderColor: 'border-indigo-500/20',
        label: 'Surgery',
    },
    MATERNITY: {
        icon: 'Baby',
        color: 'text-pink-400',
        bgColor: 'bg-pink-500/10',
        borderColor: 'border-pink-500/20',
        label: 'Maternity',
    },
    ICU: {
        icon: 'Activity',
        color: 'text-fuchsia-400',
        bgColor: 'bg-fuchsia-500/10',
        borderColor: 'border-fuchsia-500/20',
        label: 'ICU',
    },
    BILLING: {
        icon: 'CreditCard',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        label: 'Billing',
    },
    SYSTEM: {
        icon: 'Settings',
        color: 'text-gray-400',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/20',
        label: 'System',
    },
};

// ─── Quick Filter Presets ───────────────────────────────────────────────
export const QUICK_FILTERS = {
    ALL: { label: 'All Events', categories: [] as EventCategory[] },
    CLINICAL: {
        label: 'Clinical Only',
        categories: [EVENT_CATEGORY.CONSULTATION, EVENT_CATEGORY.DIAGNOSIS, EVENT_CATEGORY.NOTE] as EventCategory[],
    },
    LABS: {
        label: 'Lab & Radiology',
        categories: [EVENT_CATEGORY.LAB, EVENT_CATEGORY.RADIOLOGY] as EventCategory[],
    },
    MEDICATIONS: {
        label: 'Medications',
        categories: [EVENT_CATEGORY.PRESCRIPTION] as EventCategory[],
    },
    COMMUNICATIONS: {
        label: 'Communications',
        categories: [EVENT_CATEGORY.CHAT] as EventCategory[],
    },
    QUEUE: {
        label: 'Queue Movements',
        categories: [EVENT_CATEGORY.QUEUE] as EventCategory[],
    },
} as const;
