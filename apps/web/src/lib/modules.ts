import { ControlClient } from '@amisimedos/db/client';

let controlDbInstance: ControlClient | null = null;
export function getControlDb(): any {
    if (!controlDbInstance) {
        controlDbInstance = new ControlClient();
    }
    return controlDbInstance;
}

export type ModuleCode =
    | 'MOD-PM' | 'MOD-TQ' | 'MOD-EC' | 'MOD-LD' | 'MOD-PH' | 'MOD-IS'
    | 'MOD-BR' | 'MOD-FA' | 'MOD-HS' | 'MOD-IC' | 'MOD-RT' | 'MOD-AR'
    | 'MOD-MR' | 'MOD-SA' | 'MOD-IO' | 'MOD-DM' | 'MOD-SP' | 'MOD-SM';

export type FacilityType = 'CLINIC' | 'PHARMACY' | 'LAB' | 'SPECIALIST' | 'HOSPITAL';

// Full 18-module registry with metadata
export interface ModuleRegistryEntry {
    code: ModuleCode;
    name: string;
    description: string;
    dependencies: ModuleCode[];
    category: 'CORE' | 'CLINICAL' | 'ADMIN' | 'ANALYTICS' | 'SECURITY' | 'SPECIALTY' | 'SAAS';
}

export const MODULE_REGISTRY: ModuleRegistryEntry[] = [
    // Core (all tenants)
    { code: 'MOD-PM', name: 'Patient Management', description: 'Registration, ID, Demographics', dependencies: [], category: 'CORE' },
    { code: 'MOD-TQ', name: 'Triage & Queue Engine', description: 'Severity classification, Smart queue routing', dependencies: ['MOD-PM'], category: 'CORE' },
    { code: 'MOD-EC', name: 'EMR / Clinical', description: 'Consultations, Notes, Diagnoses, Prescriptions', dependencies: ['MOD-PM', 'MOD-TQ'], category: 'CLINICAL' },

    // Clinical
    { code: 'MOD-LD', name: 'Lab & Diagnostics', description: 'Test orders, Results, Imaging integration', dependencies: ['MOD-PM', 'MOD-EC'], category: 'CLINICAL' },
    { code: 'MOD-PH', name: 'Pharmacy', description: 'Dispensing, Stock tracking, Drug interaction checks', dependencies: ['MOD-PM', 'MOD-EC'], category: 'CLINICAL' },
    { code: 'MOD-IS', name: 'Inventory & Supply Chain', description: 'Stock, Vendors, Expiry alerts', dependencies: ['MOD-PH'], category: 'CLINICAL' },
    { code: 'MOD-BR', name: 'Billing & Revenue', description: 'Itemized billing, Payments, Insurance claims', dependencies: ['MOD-PM', 'MOD-EC', 'MOD-LD', 'MOD-PH'], category: 'CLINICAL' },
    { code: 'MOD-FA', name: 'Finance & Accounting', description: 'Revenue tracking, Expenses, Reports', dependencies: ['MOD-BR'], category: 'ADMIN' },

    // Admin
    { code: 'MOD-HS', name: 'HR & Staff Management', description: 'Scheduling, Roles, Performance tracking', dependencies: [], category: 'ADMIN' },
    { code: 'MOD-IC', name: 'Internal Communication', description: 'Messaging, Alerts, Patient-linked discussions', dependencies: ['MOD-PM'], category: 'ADMIN' },
    { code: 'MOD-RT', name: 'Referral & Transfer', description: 'Inter-facility transfers, Patient summaries', dependencies: ['MOD-PM', 'MOD-EC'], category: 'ADMIN' },

    // Analytics
    { code: 'MOD-AR', name: 'Analytics & Reporting', description: 'Operational dashboards, Financial reports, Clinical insights', dependencies: ['MOD-PM', 'MOD-EC', 'MOD-BR'], category: 'ANALYTICS' },
    { code: 'MOD-MR', name: 'Mobile & Rounds', description: 'Bedside care, Offline sync', dependencies: ['MOD-EC', 'MOD-PM'], category: 'ANALYTICS' },

    // Security
    { code: 'MOD-SA', name: 'Security & Audit', description: 'RBAC, Audit logs, Compliance tracking', dependencies: [], category: 'SECURITY' },
    { code: 'MOD-IO', name: 'Interoperability', description: 'FHIR APIs, External integrations', dependencies: ['MOD-PM', 'MOD-EC'], category: 'SECURITY' },
    { code: 'MOD-DM', name: 'Document Management', description: 'Reports, Scans, Attachments', dependencies: ['MOD-EC'], category: 'SECURITY' },

    // Specialty & SaaS
    { code: 'MOD-SP', name: 'Specialty Modules', description: 'Maternity, Pediatrics, ICU, Radiology', dependencies: ['MOD-EC', 'MOD-PM', 'MOD-TQ'], category: 'SPECIALTY' },
    { code: 'MOD-SM', name: 'SaaS Admin', description: 'Tenant onboarding, Subscription billing, Usage tracking', dependencies: ['MOD-SA'], category: 'SAAS' },
];

// Facility type presets
export const FACILITY_PRESETS: Record<FacilityType, ModuleCode[]> = {
    CLINIC:     ['MOD-PM', 'MOD-TQ', 'MOD-EC', 'MOD-BR', 'MOD-SA', 'MOD-SM', 'MOD-IC', 'MOD-AR'],
    PHARMACY:   ['MOD-PM', 'MOD-PH', 'MOD-IS', 'MOD-BR', 'MOD-SA', 'MOD-SM', 'MOD-DM'],
    LAB:        ['MOD-PM', 'MOD-LD', 'MOD-IS', 'MOD-BR', 'MOD-SA', 'MOD-SM', 'MOD-IO', 'MOD-DM'],
    SPECIALIST:  ['MOD-PM', 'MOD-TQ', 'MOD-EC', 'MOD-SP', 'MOD-BR', 'MOD-SA', 'MOD-SM', 'MOD-RT', 'MOD-AR'],
    HOSPITAL:   ['MOD-PM', 'MOD-TQ', 'MOD-EC', 'MOD-LD', 'MOD-PH', 'MOD-IS', 'MOD-BR', 'MOD-FA', 'MOD-HS', 'MOD-IC', 'MOD-RT', 'MOD-AR', 'MOD-MR', 'MOD-SA', 'MOD-IO', 'MOD-DM', 'MOD-SP', 'MOD-SM'],
};

/**
 * Resolves the set of enabled modules for a specific tenant from the control database.
 */
export async function getTenantModules(tenantId: string): Promise<Set<ModuleCode>> {
    try {
        const db = getControlDb();
        const entitlements = await db.tenantModule.findMany({
            where: {
                tenantId,
                isEnabled: true,
                OR: [
                    { validUntil: null },
                    { validUntil: { gt: new Date() } }
                ]
            },
            include: { module: true }
        });

        return new Set(entitlements.map((e: any) => (e.module as any).code as ModuleCode));
    } catch (error) {
        let message = 'Unknown error';
        if (error instanceof Error) message = error.message;
        console.error('[modules.ts] getTenantModules Error:', error);
        throw new Error('Failed to resolve tenant modules: ' + message);
    }
}

/**
 * Check if a module's dependencies are satisfied
 */
export function checkModuleDependencies(moduleCode: ModuleCode, enabledModules: Set<ModuleCode>): { satisfied: boolean; missing: ModuleCode[] } {
    const mod = MODULE_REGISTRY.find((m: any) => m.code === moduleCode);
    if (!mod) return { satisfied: false, missing: [] };
    const missing = mod.dependencies.filter((d: any) => !enabledModules.has(d));
    return { satisfied: missing.length === 0, missing: missing as ModuleCode[] };
}

/**
 * Guard function for Server Actions
 */
export async function verifyModuleAccess(tenantId: string, moduleCode: ModuleCode): Promise<any> {
    const enabledModules = await getTenantModules(tenantId);
    if (!enabledModules.has(moduleCode)) {
        throw new Error(`Access Denied: Module [${moduleCode}] is not enabled for this tenant.`);
    }
}

/**
 * Mapping of URL path prefixes to Module Codes
 */
export const MODULE_ROUTE_MAP: Record<string, ModuleCode> = {
    '/lab': 'MOD-LD',
    '/pharmacy': 'MOD-PH',
    '/inventory': 'MOD-IS',
    '/hr': 'MOD-HS',
    '/accounting': 'MOD-FA',
    '/records': 'MOD-EC',
    '/billing': 'MOD-BR',
    '/triage': 'MOD-TQ',
    '/patients': 'MOD-PM',
    '/specialty': 'MOD-SP',
    '/admin': 'MOD-SM',
};
