import { Request, Response, NextFunction } from 'express';
import { subscriptionManager, ValidationResult } from './subscription';

export interface SubscriptionMiddlewareOptions {
    exemptPaths?: string[];
    exemptRoles?: string[];
    requireFeature?: string;
}

export function createSubscriptionMiddleware(options: SubscriptionMiddlewareOptions = {}) {
    const { exemptPaths = ['/api/health', '/api/node-info', '/api/auth'], exemptRoles = ['SYSTEM'] } = options;

    return (req: Request, res: Response, next: NextFunction): void => {
        const tenantId = req.headers['x-tenant-id'] as string;
        
        if (!tenantId) {
            res.status(400).json({ error: 'Tenant ID required' });
            return;
        }

        if (exemptPaths.some(path => req.path.startsWith(path))) {
            next();
            return;
        }

        const validation = subscriptionManager.validate(tenantId);

        if (!validation.valid) {
            res.status(403).json({
                error: 'Subscription required',
                status: validation.status,
                reason: validation.reason,
                upgradeUrl: '/api/billing/upgrade'
            });
            return;
        }

        if (validation.status === 'GRACE_PERIOD' && validation.gracePeriodEnd) {
            res.set('X-Grace-Period-End', validation.gracePeriodEnd.toISOString());
        }

        (req as any).subscription = validation;
        next();
    };
}

export function checkFeature(feature: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
        const validation = (req as any).subscription as ValidationResult | undefined;
        
        if (!validation || !validation.features) {
            res.status(403).json({ error: 'Subscription required' });
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
        const validation = (req as any).subscription as ValidationResult | undefined;
        
        if (!validation || !validation.limits) {
            next();
            return;
        }

        const limit = validation.limits[limitType];
        
        if (limit === -1) {
            next();
            return;
        }

        const usage = parseInt(req.headers['x-usage-' + limitType] as string) || 0;

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