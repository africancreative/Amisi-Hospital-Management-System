import { getTenantDb as getTenantDbFromPackage, getControlDb } from '@amisi/database';
import { headers } from 'next/headers';

/**
 * Utility to get the current tenant's database client.
 * This reads the tenant ID injected by the middleware and resolves the client.
 */
export async function getTenantDb() {
    const headerList = await headers();
    let tenantId = headerList.get('x-resolved-tenant-id');

    // Development Fallback: If on localhost and no tenant context, use the first hospital
    if (!tenantId && process.env.NODE_ENV === 'development') {
        const controlDb = getControlDb();
        const firstTenant = await controlDb.tenant.findFirst();
        if (firstTenant) {
            console.warn(`[DEV] No tenant context. Falling back to default: ${firstTenant.name}`);
            tenantId = firstTenant.id;
        }
    }

    if (!tenantId) {
        throw new Error('No tenant context found. Please ensure you are accessing via a hospital subdomain.');
    }

    try {
        return await getTenantDbFromPackage(tenantId);
    } catch (error: any) {
        // Handle specific tenant status errors (suspended/terminated)
        console.error(`[DB Error] ${error.message}`);
        throw error;
    }
}
