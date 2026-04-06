import { PrismaClient } from '@prisma/client';
import { config } from './config';

type ControlClient = PrismaClient;
type TenantClient = PrismaClient;

// Global singleton for the Control Plane (System of Record)
let _controlDb: ControlClient;

export function getControlDb(): ControlClient {
    if (!_controlDb) {
        _controlDb = new PrismaClient({
            datasources: {
                db: {
                    url: config.NEON_DATABASE_URL
                }
            }
        });
    }
    return _controlDb;
}

// In-memory cache for dynamically generated Tenant clients to avoid exhausting connection pools.
// Maps `tenantId -> TenantClient`. In serverless edges, this lives per-isolate.
const tenantClients = new Map<string, TenantClient>();

/**
 * Resolves the appropriate Prisma Client for a given tenant ID.
 * This should be abstracted behind API Middleware in Next.js to ensure every request
 * is statically scoped to the parsed tenant.
 */
export async function getTenantDb(tenantId: string): Promise<TenantClient> {
    // 1. Check if we already have a hydrated client in this isolate instance
    if (tenantClients.has(tenantId)) {
        return tenantClients.get(tenantId)!;
    }

    // 2. Fetch the tenant details from the Neon Control Plane system of record
    const controlDb = getControlDb();

    const tenant = await controlDb.tenant.findUnique({
        where: { id: tenantId }
    });

    if (!tenant) {
        throw new Error(`Tenant Routing Error: Tenant ID ${tenantId} not found.`);
    }

    // 5. Strict runtime validation on Tenant status. Instant blocking.
    if (tenant.status === 'suspended') {
        throw new Error(`Tenant ${tenantId} is currently suspended. Access denied.`);
    }
    if (tenant.status === 'terminated') {
        throw new Error(`Tenant ${tenantId} is terminated. Access denied.`);
    }

    // 3. Instantiate the isolated Prisma Client dynamically connecting only to the specific Hospital DB.
    // The 'dbUrl' retrieved here is completely isolated.
    const tenantClient = new PrismaClient({
        datasources: {
            db: {
                url: tenant.dbUrl
            }
        }
    });

    // 4. Cache it locally
    tenantClients.set(tenantId, tenantClient);

    return tenantClient;
}

export async function getTenantBySlug(slug: string): Promise<TenantClient> {
    // 1. Fetch the tenant details by slug
    const controlDb = getControlDb();
    const tenant = await controlDb.tenant.findUnique({
        where: { slug }
    });

    if (!tenant) {
        throw new Error(`Tenant Routing Error: Slug ${slug} not found.`);
    }

    return getTenantDb(tenant.id);
}

// Helper to gracefully disconnect everything if the server stops
export async function disconnectAll(): Promise<void> {
    if (_controlDb) await _controlDb.$disconnect();
    for (const client of tenantClients.values()) {
        await client.$disconnect();
    }
    tenantClients.clear();
}
