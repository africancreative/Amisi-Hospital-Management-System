import { PrismaClient as ControlClient } from '@amisi/control-client';
import { PrismaClient as TenantClient } from '@amisi/tenant-client';
export declare function getControlDb(): ControlClient;
/**
 * Resolves the appropriate Prisma Client for a given tenant ID.
 * This should be abstracted behind API Middleware in Next.js to ensure every request
 * is statically scoped to the parsed tenant.
 */
export declare function getTenantDb(tenantId: string): Promise<TenantClient>;
export declare function getTenantBySlug(slug: string): Promise<TenantClient>;
export declare function disconnectAll(): Promise<void>;
