import { Role } from '@amisi/database';

/**
 * Capability-based permissions for fine-grained access control.
 * These map to the 9 functional domains and specific actions.
 */
export const PERMISSIONS = {
    // Clinical Care
    CONSULTATION_WRITE: 'CONSULTATION_WRITE',
    TRIAGE_WRITE: 'TRIAGE_WRITE',
    WARD_TRACK_WRITE: 'WARD_TRACK_WRITE',
    SURGERY_SCHEDULE: 'SURGERY_SCHEDULE',

    // Diagnostic
    LIS_RESULT_WRITE: 'LIS_RESULT_WRITE',
    RIS_REPORT_WRITE: 'RIS_REPORT_WRITE',

    // Pharmacy & Supply
    PHARM_DISPENSE: 'PHARM_DISPENSE',
    INV_AUDIT: 'INV_AUDIT',

    // Finance
    LEDGER_VIEW: 'LEDGER_VIEW',
    BILLING_ADJUST: 'BILLING_ADJUST',
    PAYROLL_PROCESS: 'PAYROLL_PROCESS',
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Default permission sets for each Role.
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    DOCTOR: ['CONSULTATION_WRITE', 'TRIAGE_WRITE', 'LIS_RESULT_WRITE', 'RIS_REPORT_WRITE'],
    NURSE: ['TRIAGE_WRITE', 'WARD_TRACK_WRITE', 'CONSULTATION_WRITE'], // Nurses can see/start consultations in triage
    PHARMACIST: ['PHARM_DISPENSE', 'INV_AUDIT'],
    LAB_TECH: ['LIS_RESULT_WRITE'],
    ACCOUNTANT: ['LEDGER_VIEW', 'BILLING_ADJUST', 'PAYROLL_PROCESS'],
    HR: ['PAYROLL_PROCESS'],
    ADMIN: Object.keys(PERMISSIONS) as Permission[],
};

/**
 * Check if a user has a specific required permission.
 */
export function hasPermission(userRole: Role, userPermissions: string[], requiredPermission: Permission): boolean {
    // 1. Check direct permissions
    if (userPermissions.includes(requiredPermission)) return true;

    // 2. Check role-based defaults
    const roleDefaults = ROLE_PERMISSIONS[userRole] || [];
    return roleDefaults.includes(requiredPermission);
}

/**
 * Get the home path for a specific role.
 */
export function getRoleHome(role: Role): string {
    switch (role) {
        case 'DOCTOR':
        case 'NURSE':
            return '/patients';
        case 'ACCOUNTANT':
            return '/billing';
        case 'PHARMACIST':
            return '/inventory';
        case 'HR':
            return '/hr';
        case 'LAB_TECH':
            return '/lab';
        default:
            return '/';
    }
}
