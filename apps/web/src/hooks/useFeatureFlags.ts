import { useMemo } from 'react';
import { TenantConfig } from '@amisimedos/constants';

/**
 * useFeatureFlags Hook
 * Provides a simple interface to check if a specific feature or module is enabled
 * for the current tenant.
 */
export function useFeatureFlags(config: TenantConfig | null) {
    const isEnabled = (featureKey: keyof TenantConfig['features']): boolean => {
        if (!config) return false;
        return !!config.features[featureKey];
    };

    const activeModules = useMemo(() => {
        if (!config) return [];
        return Object.entries(config.features)
            .filter(([_, enabled]) => enabled)
            .map(([key]) => key);
    }, [config]);

    const getWorkflowSetting = <T>(path: string, defaultValue: T): T => {
        // Implementation for deep-path lookup in config.infrastructure or custom workflow JSON
        return defaultValue;
    };

    return {
        isEnabled,
        activeModules,
        getWorkflowSetting,
        facilityType: config?.tier || 'CLINIC',
    };
}
