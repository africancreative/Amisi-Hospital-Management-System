"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getControlDb = getControlDb;
exports.getTenantDb = getTenantDb;
exports.getTenantBySlug = getTenantBySlug;
exports.disconnectAll = disconnectAll;
const control_client_1 = require("@amisi/control-client");
const tenant_client_1 = require("@amisi/tenant-client");
const config_1 = require("./config");
// Global singleton for the Control Plane (System of Record)
let _controlDb;
function getControlDb() {
    if (!_controlDb) {
        _controlDb = new control_client_1.PrismaClient({
            datasources: {
                db: {
                    url: config_1.config.NEON_DATABASE_URL
                }
            }
        });
    }
    return _controlDb;
}
// In-memory cache for dynamically generated Tenant clients to avoid exhausting connection pools.
// Maps `tenantId -> TenantClient`. In serverless edges, this lives per-isolate.
const tenantClients = new Map();
/**
 * Resolves the appropriate Prisma Client for a given tenant ID.
 * This should be abstracted behind API Middleware in Next.js to ensure every request
 * is statically scoped to the parsed tenant.
 */
async function getTenantDb(tenantId) {
    // 1. Check if we already have a hydrated client in this isolate instance
    if (tenantClients.has(tenantId)) {
        return tenantClients.get(tenantId);
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
    const tenantClient = new tenant_client_1.PrismaClient({
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
async function getTenantBySlug(slug) {
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
async function disconnectAll() {
    if (_controlDb)
        await _controlDb.$disconnect();
    for (const client of tenantClients.values()) {
        await client.$disconnect();
    }
    tenantClients.clear();
}
