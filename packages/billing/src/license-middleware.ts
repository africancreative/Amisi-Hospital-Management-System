import { Request, Response, NextFunction } from 'express';
import { licenseManager, LicenseValidationResult } from './license-local';

export interface ReadOnlyOptions {
    exemptMethods?: string[];
    exemptPaths?: string[];
    allowReadOnExpired?: boolean;
    customMessage?: string;
}

const DEFAULT_OPTIONS: ReadOnlyOptions = {
    exemptMethods: ['GET', 'HEAD', 'OPTIONS'],
    exemptPaths: ['/api/health', '/api/node-info', '/api/auth', '/api/license'],
    allowReadOnExpired: true,
    customMessage: 'Subscription expired. System is in read-only mode.'
};

export function createReadOnlyMiddleware(options: ReadOnlyOptions = {}) {
    const config = { ...DEFAULT_OPTIONS, ...options };

    return (req: Request, res: Response, next: NextFunction): void => {
        const validation = licenseManager.validate() as LicenseValidationResult;

        if (config.exemptPaths?.some(path => req.path.startsWith(path))) {
            return next();
        }

        if (config.exemptMethods?.includes(req.method)) {
            return next();
        }

        if (validation.valid) {
            (req as any).license = validation;
            return next();
        }

        if (validation.readOnly && config.allowReadOnExpired) {
            const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
            
            if (writeMethods.includes(req.method)) {
                res.status(403).json({
                    error: config.customMessage,
                    status: validation.status,
                    readOnly: true,
                    reason: validation.reason,
                    upgradeUrl: '/api/billing/upgrade'
                });
                return;
            }

            (req as any).license = validation;
            return next();
        }

        res.status(403).json({
            error: 'Subscription required',
            status: validation.status,
            reason: validation.reason,
            upgradeUrl: '/api/billing/upgrade'
        });
    };
}

export function checkFeature(feature: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const validation = (req as any).license as LicenseValidationResult | undefined;
        
        if (!validation?.features) {
            res.status(403).json({ error: 'License validation required' });
            return;
        }

        if (!validation.features.includes(feature)) {
            res.status(403).json({
                error: `Feature not available: ${feature}`,
                upgradeUrl: '/api/billing/upgrade',
                currentPlan: validation.plan?.name
            });
            return;
        }

        next();
    };
}

export function checkLimit(limitType: 'users' | 'patients' | 'storageGB' | 'apiCalls' | 'smsPerMonth') {
    return (req: Request, res: Response, next: NextFunction): void => {
        const validation = (req as any).license as LicenseValidationResult | undefined;
        
        if (!validation?.limits) {
            return next();
        }

        const limit = validation.limits[limitType];
        
        if (limit === -1) {
            return next();
        }

        if (validation.readOnly) {
            res.status(403).json({
                error: 'System is in read-only mode',
                readOnly: true
            });
            return;
        }

        const usageHeader = req.headers['x-usage-' + limitType];
        const usage = usageHeader ? parseInt(usageHeader as string) : 0;

        if (usage >= limit) {
            res.status(403).json({
                error: `Limit exceeded: ${limitType}`,
                limit,
                usage,
                upgradeUrl: '/api/billing/upgrade'
            });
            return;
        }

        next();
    };
}

export function getLicenseStatus(): { installed: boolean; status: string | null; readOnly: boolean; offline: boolean } {
    const status = licenseManager.getStatus();
    return {
        installed: status.hasLicense,
        status: status.status,
        readOnly: status.readOnly,
        offline: status.offline
    };
}