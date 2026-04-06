import { ControlClient } from '@amisi/database';

let controlDbInstance: ControlClient | null = null;
function getControlDb() {
    if (!controlDbInstance) {
        controlDbInstance = new ControlClient();
    }
    return controlDbInstance;
}

export type ModuleCode = 'LAB' | 'PHARMACY' | 'INVENTORY' | 'HR' | 'ACCOUNTING' | 'EHR' | 'BILLING';

/**
 * Resolves the set of enabled modules for a specific tenant from the control database.
 * Results are intended to be cached in middleware or session.
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

        return new Set(entitlements.map((e) => (e.module as any).code as ModuleCode));
    } catch (error) {
        let message = 'Unknown error';
        if (error instanceof Error) message = error.message;
        console.error('[modules.ts] getTenantModules Error:', error);
        throw new Error('Failed to resolve tenant modules: ' + message);
    }
}

/**
 * Guard function for Server Actions
 */
export async function verifyModuleAccess(tenantId: string, moduleCode: ModuleCode) {
    const enabledModules = await getTenantModules(tenantId);
    if (!enabledModules.has(moduleCode)) {
        throw new Error(`Access Denied: Module [${moduleCode}] is not enabled for this tenant.`);
    }
}

/**
 * Mapping of URL path prefixes to Module Codes
 */
export const MODULE_ROUTE_MAP: Record<string, ModuleCode> = {
    '/lab': 'LAB',
    '/pharmacy': 'PHARMACY',
    '/inventory': 'INVENTORY',
    '/hr': 'HR',
    '/accounting': 'ACCOUNTING',
    '/records': 'EHR',
    '/billing': 'BILLING'
};
