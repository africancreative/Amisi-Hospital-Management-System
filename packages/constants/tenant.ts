/**
 * AmisiMedOS Tenant Configuration
 * Defines the structure for tenant-specific settings and feature flags.
 */

export type SubscriptionTier = 'CLINIC' | 'STANDARD' | 'ENTERPRISE';

export interface TenantConfig {
    tenantId: string;
    organizationName: string;
    tier: SubscriptionTier;
    
    /**
     * Feature flags for modular enabling/disabling of system components.
     */
    features: {
        patientAdmin: boolean;
        queuing: boolean;
        emrCore: boolean;
        triage: boolean;
        consultation: boolean;
        pharmacy: boolean;
        laboratory: boolean;
        ward: boolean;
        billing: boolean;
        inventory: boolean;
        radiology: boolean;
        therapy: boolean;
        telemedicine: boolean;
        biometrics: boolean;
    };

    /**
     * Regional and localization settings.
     */
    localization: {
        currency: string;
        timezone: string;
        language: string;
        dateFormat: string;
    };

    /**
     * Infrastructure and Sync settings.
     */
    infrastructure: {
        isCloudEnabled: boolean;
        syncIntervalMs: number;
        fhirEndpoint?: string;
        localNodeIp?: string;
    };

    /**
     * Clinical Standards configuration.
     */
    standards: {
        preferredCodingSystem: 'SNOMED' | 'ICD10' | 'LOINC';
        useHl7Cda: boolean;
    };
}
