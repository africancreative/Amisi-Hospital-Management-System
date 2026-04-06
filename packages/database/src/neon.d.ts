/**
 * Neon API Service for Amisi HealthOS
 * Handles automated creation of isolated tenant databases.
 */
export interface NeonDbResponse {
    dbUrl: string;
    projectId: string;
    branchId: string;
}
/**
 * Creates a new isolated database/branch in Neon for a tenant.
 * Note: For production, this requires NEON_API_KEY.
 */
export declare function createTenantDatabase(slug: string): Promise<NeonDbResponse>;
