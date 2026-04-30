/**
 * AmisiMedOS Clinical Constants
 * 
 * The single source of truth for all clinical identities, roles, and status enums.
 * This package has zero dependencies to ensure stable cross-package resolution.
 */

/**
 * Deployment Tiers
 * Defines the scale and operational complexity of a clinical node.
 */
export const DeploymentTier = {
    CLINIC: 'CLINIC',
    HOSPITAL: 'HOSPITAL',
    NETWORK: 'NETWORK',
    GENERAL: 'GENERAL',
    RESEARCH: 'RESEARCH'
} as const;

export type DeploymentTier = typeof DeploymentTier[keyof typeof DeploymentTier];
export type DeploymentTierType = DeploymentTier;

/**
 * Platform Roles
 * Comprehensive list of all clinical and administrative roles.
 */
export const Role = {
    DOCTOR: 'DOCTOR',
    NURSE: 'NURSE',
    PHARMACIST: 'PHARMACIST',
    LAB_TECH: 'LAB_TECH',
    ACCOUNTANT: 'ACCOUNTANT',
    HR_MANAGER: 'HR_MANAGER',
    HR: 'HR',
    ADMIN: 'ADMIN',
    MIDWIFE: 'MIDWIFE',
    ICU_NURSE: 'ICU_NURSE',
    ONCOLOGY_NURSE: 'ONCOLOGY_NURSE',
    RADIOGRAPHER: 'RADIOGRAPHER',
    RADIOLOGIST: 'RADIOLOGIST',
    RECEPTIONIST: 'RECEPTIONIST',
    SECURITY: 'SECURITY',
    CLEANER: 'CLEANER',
    DRIVER: 'DRIVER',
    PATHOLOGIST: 'PATHOLOGIST',
    PROCUREMENT_MANAGER: 'PROCUREMENT_MANAGER',
    INVENTORY_CLERK: 'INVENTORY_CLERK',
    ADMISSIONS: 'ADMISSIONS',
    NURSE_MANAGER: 'NURSE_MANAGER',
    HIM_OFFICER: 'HIM_OFFICER',
    AUDITOR: 'AUDITOR',
    SURGEON: 'SURGEON',
    ANESTHESIOLOGIST: 'ANESTHESIOLOGIST',
    OT_MANAGER: 'OT_MANAGER',
    PATIENT_PORTAL: 'PATIENT_PORTAL',
    SUPER_ADMIN: 'SUPER_ADMIN'
} as const;

export type Role = typeof Role[keyof typeof Role];
export type RoleType = Role;

/**
 * Tenant Operational Status
 */
export const TenantStatus = {
    ACTIVE: 'ACTIVE',
    SUSPENDED: 'SUSPENDED',
    MAINTENANCE: 'MAINTENANCE'
} as const;

export type TenantStatus = typeof TenantStatus[keyof typeof TenantStatus];

export * from './loinc';
