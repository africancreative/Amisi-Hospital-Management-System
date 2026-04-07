import { PrismaClient as ControlClientRaw } from '../generated/control-client';
import { PrismaClient as TenantClientRaw } from '../generated/tenant-client';
import { config } from './config';

export { ControlClientRaw as ControlClient, TenantClientRaw as TenantClient };

/**
 * Production-Grade Singleton Pattern for Prisma Clients
 * Prevents multiple instances during Next.js Hot Module Replacement (HMR)
 */

declare global {
    var prismaControl: ControlClientRaw | undefined;
    var prismaTenants: Map<string, TenantClientRaw> | undefined;
}

/**
 * Platform Control Plane (Source of Truth)
 * Targets Neon Cloud exclusively
 */
export const getControlDb = (): ControlClientRaw => {
    if (process.env.NODE_ENV === 'production') {
        return new ControlClientRaw({
            datasources: {
                db: { url: config.NEON_DATABASE_URL }
            }
        });
    }

    if (!global.prismaControl) {
        console.log('[Amisi DB] Initializing Control Plane Singleton...');
        global.prismaControl = new ControlClientRaw({
            datasources: {
                db: { url: config.NEON_DATABASE_URL }
            }
        });
    }

    return global.prismaControl;
};

/**
 * Clinical Tenant Nodes (Hospital Data)
 * Dynamic routing per hospital ID (UUID)
 */
export const getTenantDb = async (tenantId: string, customUrl?: string): Promise<TenantClientRaw> => {
    // 1. Resolve connection URL: Provided > Local Edge > Cloud Neon
    const tenantUrl = customUrl || config.LOCAL_EDGE_DATABASE_URL || config.NEON_DATABASE_URL;

    if (process.env.NODE_ENV === 'production') {
        return new TenantClientRaw({
            datasources: {
                db: { url: tenantUrl }
            }
        });
    }

    if (!global.prismaTenants) {
        global.prismaTenants = new Map<string, TenantClientRaw>();
    }

    if (!global.prismaTenants.has(tenantId)) {
        console.log(`[Amisi DB] Initializing Tenant Singleton for Node: ${tenantId.substring(0, 8)}...`);
        global.prismaTenants.set(tenantId, new TenantClientRaw({
            datasources: {
                db: { url: tenantUrl }
            }
        }));
    }

    return global.prismaTenants.get(tenantId)!;
};

/**
 * Resolves a clinical Tenant Node by its URL slug.
 * Essential for Next.js dynamic routing ([slug]/dashboard).
 */
export const getTenantBySlug = async (slug: string): Promise<TenantClientRaw> => {
    const controlDb = getControlDb();
    const tenant = await controlDb.tenant.findUnique({
        where: { slug }
    });

    if (!tenant) {
        throw new Error(`[Routing Error] Clinical Node not found for slug: ${slug}`);
    }

    // Dynamic routing to the isolated DB URL
    return getTenantDb(tenant.id, tenant.dbUrl);
};

/**
 * Utility for forced client disposal (useful for testing)
 */
export const disposeClients = async () => {
    if (global.prismaControl) {
        await global.prismaControl.$disconnect();
        global.prismaControl = undefined;
    }

    if (global.prismaTenants) {
        for (const client of global.prismaTenants.values()) {
            await client.$disconnect();
        }
        global.prismaTenants.clear();
    }
};
