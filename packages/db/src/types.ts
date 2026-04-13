/**
 * Clinical Type Systems for AmisiMedOS
 * 
 * Re-exports enums and types from the centralized @amisimedos/constants package.
 * This ensures that the database package uses the same nominal types as the rest
 * of the platform, resolving resolution loops.
 */

export { 
    DeploymentTier, 
    Role, 
    TenantStatus 
} from '@amisimedos/constants';

export type { 
    DeploymentTierType, 
    RoleType 
} from '@amisimedos/constants';

import { Decimal as DecimalRaw } from '../generated/tenant-client/runtime/library';
import { Prisma as PrismaRaw } from '../generated/control-client';

// Data Classes
export const Decimal = DecimalRaw;
export const Prisma = PrismaRaw;

// Model Types (Structural Only)
export type { Tenant, Module, TenantModule } from '../generated/control-client';
export type { VitalsLog, Encounter, Patient } from '../generated/tenant-client';
export type { Decimal as DecimalType } from '../generated/tenant-client/runtime/library';
