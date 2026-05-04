/**
 * Staff Activity Tracking & Performance — Type Definitions
 *
 * Bridges HR (Employee model) with clinical operations by tracking:
 * - Queue assignments (who handled which patients)
 * - Time spent per patient/encounter
 * - Clinical actions logged in EMR
 * - Chat communication volume and response times
 * - Performance metrics aggregation
 */

// ─── Activity Types ─────────────────────────────────────────────────────
export const ACTIVITY_TYPE = {
    QUEUE_ASSIGNMENT: 'QUEUE_ASSIGNMENT',
    QUEUE_CALL_NEXT: 'QUEUE_CALL_NEXT',
    ENCOUNTER_START: 'ENCOUNTER_START',
    ENCOUNTER_COMPLETE: 'ENCOUNTER_COMPLETE',
    CLINICAL_NOTE_CREATED: 'CLINICAL_NOTE_CREATED',
    PRESCRIPTION_CREATED: 'PRESCRIPTION_CREATED',
    PRESCRIPTION_DISPENSED: 'PRESCRIPTION_DISPENSED',
    LAB_ORDER_CREATED: 'LAB_ORDER_CREATED',
    LAB_RESULT_VALIDATED: 'LAB_RESULT_VALIDATED',
    RADIOLOGY_ORDER_CREATED: 'RADIOLOGY_ORDER_CREATED',
    RADIOLOGY_REPORT_SIGNED: 'RADIOLOGY_REPORT_SIGNED',
    VITALS_RECORDED: 'VITALS_RECORDED',
    TRIAGE_COMPLETED: 'TRIAGE_COMPLETED',
    PATIENT_TRANSFERRED: 'PATIENT_TRANSFERRED',
    DISCHARGE_COMPLETED: 'DISCHARGE_COMPLETED',
    CHAT_MESSAGE_SENT: 'CHAT_MESSAGE_SENT',
    CHAT_RESPONSE: 'CHAT_RESPONSE',
    CONSENT_SIGNED: 'CONSENT_SIGNED',
    SHIFT_CLOCK_IN: 'SHIFT_CLOCK_IN',
    SHIFT_CLOCK_OUT: 'SHIFT_CLOCK_OUT',
} as const;

export type ActivityType = (typeof ACTIVITY_TYPE)[keyof typeof ACTIVITY_TYPE];

// ─── Activity Category (grouping) ───────────────────────────────────────
export const ACTIVITY_CATEGORY = {
    QUEUE: 'QUEUE',
    CLINICAL: 'CLINICAL',
    DIAGNOSTICS: 'DIAGNOSTICS',
    PHARMACY: 'PHARMACY',
    COMMUNICATION: 'COMMUNICATION',
    ADMINISTRATIVE: 'ADMINISTRATIVE',
} as const;

export type ActivityCategory = (typeof ACTIVITY_CATEGORY)[keyof typeof ACTIVITY_CATEGORY];

export const CATEGORY_ACTIVITIES: Record<ActivityCategory, ActivityType[]> = {
    QUEUE: [
        ACTIVITY_TYPE.QUEUE_ASSIGNMENT,
        ACTIVITY_TYPE.QUEUE_CALL_NEXT,
        ACTIVITY_TYPE.TRIAGE_COMPLETED,
        ACTIVITY_TYPE.PATIENT_TRANSFERRED,
    ],
    CLINICAL: [
        ACTIVITY_TYPE.ENCOUNTER_START,
        ACTIVITY_TYPE.ENCOUNTER_COMPLETE,
        ACTIVITY_TYPE.CLINICAL_NOTE_CREATED,
        ACTIVITY_TYPE.VITALS_RECORDED,
        ACTIVITY_TYPE.DISCHARGE_COMPLETED,
        ACTIVITY_TYPE.CONSENT_SIGNED,
    ],
    DIAGNOSTICS: [
        ACTIVITY_TYPE.LAB_ORDER_CREATED,
        ACTIVITY_TYPE.LAB_RESULT_VALIDATED,
        ACTIVITY_TYPE.RADIOLOGY_ORDER_CREATED,
        ACTIVITY_TYPE.RADIOLOGY_REPORT_SIGNED,
    ],
    PHARMACY: [
        ACTIVITY_TYPE.PRESCRIPTION_CREATED,
        ACTIVITY_TYPE.PRESCRIPTION_DISPENSED,
    ],
    COMMUNICATION: [
        ACTIVITY_TYPE.CHAT_MESSAGE_SENT,
        ACTIVITY_TYPE.CHAT_RESPONSE,
    ],
    ADMINISTRATIVE: [
        ACTIVITY_TYPE.SHIFT_CLOCK_IN,
        ACTIVITY_TYPE.SHIFT_CLOCK_OUT,
    ],
};

// ─── Staff Activity Entry ───────────────────────────────────────────────
export interface StaffActivityEntry {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeRole: string;
    department: string;
    activityType: ActivityType;
    category: ActivityCategory;
    patientId?: string | null;
    patientName?: string | null;
    encounterId?: string | null;
    resourceId?: string | null;
    resourceType?: string | null;
    queueNumber?: string | null;
    title: string;
    description?: string | null;
    startedAt?: Date | null;
    completedAt: Date;
    durationSeconds?: number | null;
}

// ─── Staff Assignment (active assignment to queue/department/patient) ───
export interface StaffAssignment {
    id: string;
    employeeId: string;
    employeeName: string;
    employeeRole: string;
    department: string;
    assignmentType: 'QUEUE' | 'DEPARTMENT' | 'PATIENT';
    queueId?: string | null;
    queueNumber?: string | null;
    departmentName?: string | null;
    patientId?: string | null;
    patientName?: string | null;
    encounterId?: string | null;
    assignedAt: Date;
    releasedAt?: Date | null;
    isActive: boolean;
}

// ─── Performance Metrics (per employee, per period) ─────────────────────
export interface StaffPerformanceMetrics {
    employeeId: string;
    employeeName: string;
    employeeRole: string;
    department: string;
    period: 'daily' | 'weekly' | 'monthly';
    periodStart: Date;
    periodEnd: Date;

    // Queue metrics
    patientsSeen: number;
    avgWaitTimeMinutes: number;
    avgConsultationMinutes: number;
    queueAssignments: number;

    // Clinical metrics
    encountersCompleted: number;
    clinicalNotesWritten: number;
    prescriptionsWritten: number;
    labOrdersPlaced: number;
    radiologyOrdersPlaced: number;

    // Communication metrics
    chatMessagesSent: number;
    avgResponseTimeMinutes: number;

    // Time metrics
    totalActiveMinutes: number;
    totalPatientMinutes: number;
    utilizationPercent: number;

    // Efficiency score (0-100)
    efficiencyScore: number;
}

// ─── Department Performance Summary ─────────────────────────────────────
export interface DepartmentPerformance {
    department: string;
    totalStaff: number;
    activeStaff: number;
    patientsSeen: number;
    avgConsultationMinutes: number;
    totalEncounters: number;
    totalChatMessages: number;
    topPerformers: StaffPerformanceMetrics[];
}

// ─── Dashboard Overview ─────────────────────────────────────────────────
export interface StaffDashboardOverview {
    totalActiveStaff: number;
    staffOnDuty: number;
    staffOnLeave: number;
    totalPatientsToday: number;
    totalEncountersToday: number;
    avgConsultationTimeToday: number;
    busiestDepartment: string;
    topPerformerToday: StaffPerformanceMetrics | null;
    departmentSummaries: DepartmentPerformance[];
}

// ─── Filter Options ─────────────────────────────────────────────────────
export interface StaffActivityFilters {
    employeeId?: string;
    department?: string;
    role?: string;
    categories?: ActivityCategory[];
    dateFrom?: Date;
    dateTo?: Date;
    patientId?: string;
    encounterId?: string;
}

// ─── Performance Period Options ─────────────────────────────────────────
export type PerformancePeriod = 'today' | 'week' | 'month' | 'custom';

// ─── Staff Card Data (for list views) ───────────────────────────────────
export interface StaffCardData {
    id: string;
    employeeId: string;
    firstName: string;
    lastName: string;
    role: string;
    department: string;
    status: string;
    currentAssignment?: StaffAssignment | null;
    todayMetrics?: {
        patientsSeen: number;
        activeEncounters: number;
        totalMinutes: number;
    };
    isOnDuty: boolean;
}
