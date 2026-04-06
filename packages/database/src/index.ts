export * from './config';
export * from './tenant-routing';
export * from './provision';
export * from './neon';
export * from './update';

export { PrismaClient } from '@prisma/client';
export { getControlDb, getTenantDb } from './tenant-routing';
export { provisionTenant, type ExtendedSettings, type AdminInfo } from './provision';
export { createTenantDatabase, type NeonDbResponse } from './neon';
export type { Decimal } from '@prisma/client/runtime/library';
export type { default as ControlClient } from '@prisma/client';

// Type exports for DeploymentTier - needs to be defined here since it's a local type
export type DeploymentTier = 'CLINIC' | 'GENERAL' | 'RESEARCH';

// TenantClient is just a type alias for PrismaClient (for isolated tenant DBs)
export type TenantClient = ReturnType<typeof getTenantDb>;
