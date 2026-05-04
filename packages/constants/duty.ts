/**
 * AmisiMedOS On-Duty Mode
 * Defines the state and constraints for role-specific operational modes.
 */

export type UserRole = 
    | 'RECEPTIONIST' 
    | 'NURSE_TRIAGE' 
    | 'DOCTOR' 
    | 'NURSE_WARD' 
    | 'PHARMACIST' 
    | 'LAB_TECH' 
    | 'CASHIER' 
    | 'ADMIN';

export interface OnDutyState {
    activeRole: UserRole;
    facilityId: string;
    departmentId: string;
    startTime: string; // ISO string
    
    /**
     * UI Constraints for On-Duty Mode
     */
    constraints: {
        isSidebarHidden: boolean;
        isNavigationLocked: boolean;
        showUrgentQueue: boolean;
        autoLockTimeoutMs: number;
    };

    /**
     * Active session metrics
     */
    sessionMetrics: {
        patientsProcessed: number;
        averageTimePerPatientMinutes: number;
        pendingTasksCount: number;
    };
}

export const DEFAULT_ON_DUTY_CONSTRAINTS: Record<UserRole, OnDutyState['constraints']> = {
    RECEPTIONIST: {
        isSidebarHidden: false,
        isNavigationLocked: false,
        showUrgentQueue: true,
        autoLockTimeoutMs: 3600000,
    },
    NURSE_TRIAGE: {
        isSidebarHidden: true,
        isNavigationLocked: true,
        showUrgentQueue: true,
        autoLockTimeoutMs: 1800000,
    },
    DOCTOR: {
        isSidebarHidden: true,
        isNavigationLocked: true,
        showUrgentQueue: true,
        autoLockTimeoutMs: 900000,
    },
    NURSE_WARD: {
        isSidebarHidden: true,
        isNavigationLocked: true,
        showUrgentQueue: false,
        autoLockTimeoutMs: 1800000,
    },
    PHARMACIST: {
        isSidebarHidden: true,
        isNavigationLocked: true,
        showUrgentQueue: false,
        autoLockTimeoutMs: 1800000,
    },
    LAB_TECH: {
        isSidebarHidden: true,
        isNavigationLocked: true,
        showUrgentQueue: false,
        autoLockTimeoutMs: 1800000,
    },
    CASHIER: {
        isSidebarHidden: false,
        isNavigationLocked: true,
        showUrgentQueue: false,
        autoLockTimeoutMs: 3600000,
    },
    ADMIN: {
        isSidebarHidden: false,
        isNavigationLocked: false,
        showUrgentQueue: false,
        autoLockTimeoutMs: 3600000,
    },
};
