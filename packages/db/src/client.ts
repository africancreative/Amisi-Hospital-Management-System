import { PrismaClient as ControlClientRaw } from '../generated/control-client';
import { PrismaClient as TenantClientRaw } from '../generated/tenant-client';
import { config } from './config';
import { withJournaling } from './extension-journal';
import { initializeEventHandlers } from './events/handlers';

// Initialize reactive hub-and-spoke integration architecture
initializeEventHandlers();

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
    const dbUrl = config.NEON_DATABASE_URL + (config.NEON_DATABASE_URL.includes('?') ? '&' : '?') + 'connect_timeout=10';

    if (process.env.NODE_ENV === 'production') {
        return new ControlClientRaw({
            datasources: {
                db: { url: dbUrl }
            }
        });
    }

    if (!global.prismaControl) {
        console.log('[Amisi DB] Initializing Control Plane Singleton...');
        global.prismaControl = new ControlClientRaw({
            datasources: {
                db: { url: dbUrl }
            }
        });
    }

    return global.prismaControl;
};

/**
 * Clinical Tenant Nodes (Hospital Data)
 * Dynamic routing per hospital ID (UUID)
 */

// Connection pool cache - reuse Prisma clients by URL to prevent pool exhaustion
const tenantClientCache = new Map<string, TenantClientRaw>();

export const getTenantDb = async (tenantId: string, customUrl?: string): Promise<TenantClientRaw> => {
    // 1. Resolve connection URL: Provided > Local Edge > Cloud Neon
    const tenantUrl = customUrl || config.LOCAL_EDGE_DATABASE_URL || config.NEON_DATABASE_URL;

    // Add connection pool parameters to prevent timeouts
    const urlWithPool = tenantUrl + (tenantUrl.includes('?') ? '&' : '?') + 'connect_timeout=30&connection_limit=20&pool_timeout=30';

    // Check cache first
    const cacheKey = `${tenantId}:${urlWithPool}`;
    if (tenantClientCache.has(cacheKey)) {
        return tenantClientCache.get(cacheKey)!;
    }

    const baseClient = new TenantClientRaw({
        datasources: {
            db: { url: urlWithPool }
        }
    });

    // 2. Wrap with Sync Journaling if shared secret is available
    const sharedSecret = process.env.SYNC_SHARED_SECRET || config.SYNC_SHARED_SECRET;
    const nodeType = process.env.NODE_TYPE === 'CLOUD' ? 'CLOUD' : 'EDGE';

    let clientToCache: any = baseClient;

    if (sharedSecret) {
        const journaledClient = baseClient.$extends(withJournaling({
            sharedSecret,
            nodeType: nodeType as any,
            tenantId: tenantId
        }));
        clientToCache = journaledClient;
    }

    // Cache the client for reuse
    tenantClientCache.set(cacheKey, clientToCache as TenantClientRaw);

    // Also store in global for cleanup/disposal
    if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
        if (!global.prismaTenants) global.prismaTenants = new Map<string, any>();
        global.prismaTenants.set(tenantId, clientToCache);
    }

    return clientToCache as any;
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

// --- Consolidated Platform Exports ---
export { 
    DeploymentTier, 
    Decimal, 
    Prisma, 
    Role, 
    TenantStatus 
} from './types';

export type { 
    DeploymentTierType, 
    RoleType, 
    Tenant, 
    Module, 
    TenantModule 
} from './types';


/**
 * Singleton 'db' Export
 * Primarily targets the Control Plane for SaaS administrative and shared operations.
 */
export const db = getControlDb();





