import { EventEmitter } from 'events';
import crypto from 'crypto';
import { PLANS, Plan, PlanCode } from './plans';

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'GRACE_PERIOD' | 'SUSPENDED' | 'CANCELLED';

export interface Subscription {
    id: string;
    tenantId: string;
    planCode: PlanCode;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    gracePeriodEnd: Date | null;
    autoRenew: boolean;
    paymentMethod: 'M-PESA' | 'PAYPAL' | 'BANK_TRANSFER' | 'FREE';
    paymentReference: string | null;
    lastPaymentDate: Date | null;
    nextPaymentAmount: number;
    nextPaymentDate: Date | null;
    features: string[];
    limits: {
        users: number;
        patients: number;
        storageGB: number;
        apiCalls: number;
        smsPerMonth: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

export interface ValidationResult {
    valid: boolean;
    status: SubscriptionStatus;
    reason?: string;
    gracePeriodEnd?: Date;
    plan?: Plan;
    features?: string[];
    limits?: Subscription['limits'];
}

export interface UsageMetrics {
    users: number;
    patients: number;
    storageUsed: number;
    apiCalls: number;
    smsUsed: number;
}

export const GRACE_PERIOD_HOURS = 72;
export const GRACE_PERIOD_MS = GRACE_PERIOD_HOURS * 60 * 60 * 1000;

class SubscriptionManager extends EventEmitter {
    private static instance: SubscriptionManager;
    private subscriptions: Map<string, Subscription> = new Map();
    private usageCache: Map<string, UsageMetrics> = new Map();

    private constructor() {
        super();
    }

    public static getInstance(): SubscriptionManager {
        if (!SubscriptionManager.instance) {
            SubscriptionManager.instance = new SubscriptionManager();
        }
        return SubscriptionManager.instance;
    }

    public setSubscription(subscription: Subscription): void {
        this.subscriptions.set(subscription.tenantId, subscription);
        this.emit('subscriptionUpdated', subscription);
    }

    public getSubscription(tenantId: string): Subscription | undefined {
        return this.subscriptions.get(tenantId);
    }

    public validate(tenantId: string): ValidationResult {
        const subscription = this.subscriptions.get(tenantId);

        if (!subscription) {
            return {
                valid: false,
                status: 'EXPIRED',
                reason: 'No subscription found'
            };
        }

        const now = new Date();

        if (subscription.status === 'CANCELLED') {
            return {
                valid: false,
                status: 'CANCELLED',
                reason: 'Subscription is cancelled'
            };
        }

        if (subscription.status === 'SUSPENDED') {
            return {
                valid: false,
                status: 'SUSPENDED',
                reason: 'Subscription is suspended'
            };
        }

        if (subscription.status === 'ACTIVE') {
            if (now < subscription.currentPeriodEnd) {
                const plan = PLANS[subscription.planCode];
                return {
                    valid: true,
                    status: 'ACTIVE',
                    plan,
                    features: plan.features.filter(f => f.included).map(f => f.name),
                    limits: subscription.limits
                };
            }

            const graceEnd = new Date(subscription.currentPeriodEnd.getTime() + GRACE_PERIOD_MS);
            
            if (now < graceEnd) {
                this.subscriptions.set(tenantId, {
                    ...subscription,
                    status: 'GRACE_PERIOD',
                    gracePeriodEnd: graceEnd
                });

                const plan = PLANS[subscription.planCode];
                return {
                    valid: true,
                    status: 'GRACE_PERIOD',
                    reason: `Subscription expired. Grace period until ${graceEnd.toISOString()}`,
                    gracePeriodEnd: graceEnd,
                    plan,
                    features: plan.features.filter(f => f.included).map(f => f.name),
                    limits: subscription.limits
                };
            }

            this.subscriptions.set(tenantId, {
                ...subscription,
                status: 'EXPIRED'
            });

            return {
                valid: false,
                status: 'EXPIRED',
                reason: `Subscription expired after ${GRACE_PERIOD_HOURS}-hour grace period`
            };
        }

        if (subscription.status === 'GRACE_PERIOD') {
            const graceEnd = subscription.gracePeriodEnd;
            
            if (graceEnd && now < graceEnd) {
                const plan = PLANS[subscription.planCode];
                return {
                    valid: true,
                    status: 'GRACE_PERIOD',
                    reason: `Grace period active until ${graceEnd.toISOString()}`,
                    gracePeriodEnd: graceEnd,
                    plan,
                    features: plan.features.filter(f => f.included).map(f => f.name),
                    limits: subscription.limits
                };
            }

            this.subscriptions.set(tenantId, {
                ...subscription,
                status: 'EXPIRED'
            });

            return {
                valid: false,
                status: 'EXPIRED',
                reason: 'Grace period expired'
            };
        }

        return {
            valid: false,
            status: subscription.status,
            reason: 'Unknown subscription status'
        };
    }

    public checkUsage(tenantId: string, usage: Partial<UsageMetrics>): { allowed: boolean; overLimit?: string } {
        const subscription = this.subscriptions.get(tenantId);
        
        if (!subscription) {
            return { allowed: false };
        }

        const currentUsage = this.usageCache.get(tenantId) || {
            users: 0, patients: 0, storageUsed: 0, apiCalls: 0, smsUsed: 0
        };

        const newUsage = { ...currentUsage, ...usage };

        if (subscription.limits.users > 0 && newUsage.users > subscription.limits.users) {
            return { allowed: false, overLimit: `users: ${newUsage.users}/${subscription.limits.users}` };
        }

        if (subscription.limits.patients > 0 && newUsage.patients > subscription.limits.patients) {
            return { allowed: false, overLimit: `patients: ${newUsage.patients}/${subscription.limits.patients}` };
        }

        if (subscription.limits.storageGB > 0 && newUsage.storageUsed > subscription.limits.storageGB) {
            return { allowed: false, overLimit: `storage: ${newUsage.storageUsed}GB/${subscription.limits.storageGB}GB` };
        }

        if (subscription.limits.apiCalls > 0 && newUsage.apiCalls > subscription.limits.apiCalls) {
            return { allowed: false, overLimit: `apiCalls: ${newUsage.apiCalls}/${subscription.limits.apiCalls}` };
        }

        if (subscription.limits.smsPerMonth > 0 && newUsage.smsUsed > subscription.limits.smsPerMonth) {
            return { allowed: false, overLimit: `sms: ${newUsage.smsUsed}/${subscription.limits.smsPerMonth}` };
        }

        this.usageCache.set(tenantId, newUsage);
        return { allowed: true };
    }

    public createSubscription(tenantId: string, planCode: PlanCode): Subscription {
        const plan = PLANS[planCode];
        const now = new Date();
        const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const subscription: Subscription = {
            id: crypto.randomUUID(),
            tenantId,
            planCode,
            status: planCode === 'FREE' ? 'ACTIVE' : 'GRACE_PERIOD',
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            gracePeriodEnd: planCode === 'FREE' ? null : new Date(periodEnd.getTime() + GRACE_PERIOD_MS),
            autoRenew: true,
            paymentMethod: 'FREE',
            paymentReference: null,
            lastPaymentDate: null,
            nextPaymentAmount: plan.monthlyPrice,
            nextPaymentDate: periodEnd,
            features: plan.features.filter(f => f.included).map(f => f.name),
            limits: { ...plan.limits },
            createdAt: now,
            updatedAt: now
        };

        this.subscriptions.set(tenantId, subscription);
        return subscription;
    }

    public activateSubscription(tenantId: string): void {
        const subscription = this.subscriptions.get(tenantId);
        if (!subscription) return;

        const now = new Date();
        const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        this.subscriptions.set(tenantId, {
            ...subscription,
            status: 'ACTIVE',
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            gracePeriodEnd: null,
            lastPaymentDate: now
        });

        this.emit('activated', subscription);
    }

    public expireSubscription(tenantId: string): void {
        const subscription = this.subscriptions.get(tenantId);
        if (!subscription) return;

        this.subscriptions.set(tenantId, {
            ...subscription,
            status: 'EXPIRED'
        });

        this.emit('expired', subscription);
    }

    public suspendSubscription(tenantId: string): void {
        const subscription = this.subscriptions.get(tenantId);
        if (!subscription) return;

        this.subscriptions.set(tenantId, {
            ...subscription,
            status: 'SUSPENDED'
        });

        this.emit('suspended', subscription);
    }

    public getStatus(tenantId: string): { status: SubscriptionStatus; gracePeriodEnd?: Date | null; planCode?: PlanCode } {
        const subscription = this.subscriptions.get(tenantId);
        if (!subscription) {
            return { status: 'EXPIRED' };
        }
        return {
            status: subscription.status,
            gracePeriodEnd: subscription.gracePeriodEnd,
            planCode: subscription.planCode
        };
    }
}

export const subscriptionManager = SubscriptionManager.getInstance();