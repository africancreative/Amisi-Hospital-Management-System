/**
 * Shared Clinical Value Objects (Enums)
 * 
 * Redefined locally to break the build-time dependency on database-specific 
 * infrastructure modules during UI bundling.
 */

export enum DeploymentTier {
    CLINIC = 'CLINIC',
    HOSPITAL = 'HOSPITAL',
    NETWORK = 'NETWORK'
}
