import { DeploymentTier } from '@amisi/control-client';
export interface ExtendedSettings {
    contactEmail?: string | null;
    phone?: string | null;
    detailedAddress?: string | null;
    taxId?: string | null;
    logoUrl?: string | null;
    marketingSlogan?: string | null;
}
export interface AdminInfo {
    name: string;
    email: string;
    passwordHash: string;
}
/**
 * Provisions a new Tenant
 * 1. Creates a record in the Neon Control Plane.
 * 2. Emits a new Encryption Key ID.
 * 3. Applies the latest tenant schema migration to their isolated database.
 * 4. Seeds initial hospital settings.
 */
export declare function provisionTenant(name: string, slug: string, region: string, isolatedDbUrl: string, tier?: DeploymentTier, settings?: ExtendedSettings, enabledModules?: any, admin?: AdminInfo): Promise<{
    status: import("@amisi/control-client").$Enums.TenantStatus;
    id: string;
    slug: string;
    name: string;
    dbUrl: string;
    encryptionKeyReference: string;
    tier: import("@amisi/control-client").$Enums.DeploymentTier;
    region: string;
    suspensionReason: string | null;
    suspendedAt: Date | null;
    enabledModules: import("@amisi/control-client/runtime/library").JsonValue;
    publicKeySpki: string | null;
    sharedSecret: string | null;
    createdAt: Date;
    updatedAt: Date;
}>;
