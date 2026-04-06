import { getTenantDb as getTenantDbFromPackage, getControlDb, type TenantClient } from '@amisi/database';
import { headers } from 'next/headers';
export { getControlDb, type TenantClient };

/**
 * Utility to get the current tenant's database client.
 * This reads the tenant ID injected by the middleware and resolves the client.
 */
export async function getTenantDb(providedTenantId?: string): Promise<TenantClient> {
    if (providedTenantId) {
        return await getTenantDbFromPackage(providedTenantId);
    }

    const headerList = await headers();
    let tenantId = headerList.get('x-resolved-tenant-id');

    // Development Fallback: If on localhost and no tenant context, use the first hospital
    if (!tenantId && process.env.NODE_ENV === 'development') {
        try {
            const controlDb = getControlDb();
            const firstTenant = await controlDb.tenant.findFirst();
            if (firstTenant) {
                console.warn(`[DEV] No tenant context. Falling back to default: ${firstTenant.name}`);
                tenantId = firstTenant.id;
            }
        } catch (dbErr: any) {
            console.error(`[DEV DB Warning] Failed to reach Control Plane: ${dbErr.message}`);
        }
    }

    if (!tenantId) {
        throw new Error('No tenant context found. Please ensure you are accessing via a hospital subdomain.');
    }

    try {
        return await getTenantDbFromPackage(tenantId);
    } catch (error) {
        // Handle specific tenant status errors (suspended/terminated)
        if (error instanceof Error) {
            console.error(`[DB Error] ${error.message}`);
        }
        throw error;
    }
}
