import { EventEmitter } from 'events';
import crypto from 'crypto';
import { Subscription, SubscriptionStatus, ValidationResult, GRACE_PERIOD_MS } from './subscription';
import { PLANS, Plan, PlanCode } from './plans';

export interface LicenseData {
    tenantId: string;
    planCode: PlanCode;
    status: SubscriptionStatus;
    validUntil: string;
    gracePeriodEnd: string | null;
    features: string[];
    limits: {
        users: number;
        patients: number;
        storageGB: number;
        apiCalls: number;
        smsPerMonth: number;
    };
    signature: string;
    issuedAt: string;
    version: string;
}

export interface LicenseValidationResult {
    valid: boolean;
    status: SubscriptionStatus;
    readOnly: boolean;
    reason?: string;
    gracePeriodEnd?: Date;
    plan?: Plan;
    features?: string[];
    limits?: LicenseData['limits'];
    offlineMode: boolean;
}

const LICENSE_VERSION = '1.0.0';
const OFFLINE_CHECK_INTERVAL = 60000;

class LicenseManager extends EventEmitter {
    private static instance: LicenseManager;
    private localLicense: LicenseData | null = null;
    private licenseCheckInterval: NodeJS.Timeout | null = null;
    private isOffline = false;
    private sharedSecret: string = '';

    private constructor() {
        super();
    }

    public static getInstance(): LicenseManager {
        if (!LicenseManager.instance) {
            LicenseManager.instance = new LicenseManager();
        }
        return LicenseManager.instance;
    }

    public configure(sharedSecret: string): void {
        this.sharedSecret = sharedSecret;
    }

    public async loadFromStorage(): Promise<LicenseData | null> {
        try {
            const stored = localStorage.getItem('amisimedos_license');
            if (stored) {
                const license = JSON.parse(stored) as LicenseData;
                
                if (this.validateSignature(license)) {
                    this.localLicense = license;
                    console.log('[License] Loaded local license:', license.planCode, license.status);
                    return license;
                } else {
                    console.warn('[License] Invalid license signature');
                    localStorage.removeItem('amisimedos_license');
                }
            }
        } catch (error) {
            console.error('[License] Failed to load from storage:', error);
        }
        return null;
    }

    public saveToStorage(license: LicenseData): void {
        try {
            localStorage.setItem('amisimedos_license', JSON.stringify(license));
            this.localLicense = license;
            console.log('[License] Saved to local storage');
        } catch (error) {
            console.error('[License] Failed to save to storage:', error);
        }
    }

    public installLicense(cloudLicense: Omit<LicenseData, 'signature' | 'issuedAt' | 'version'>): boolean {
        const issuedAt = new Date().toISOString();
        
        const payload = JSON.stringify({
            ...cloudLicense,
            issuedAt,
            version: LICENSE_VERSION
        });

        const signature = crypto
            .createHmac('sha256', this.sharedSecret)
            .update(payload)
            .digest('hex');

        const license: LicenseData = {
            ...cloudLicense,
            signature,
            issuedAt,
            version: LICENSE_VERSION
        };

        if (!this.validateSignature(license)) {
            console.error('[License] Invalid signature');
            return false;
        }

        this.saveToStorage(license);
        this.emit('installed', license);
        return true;
    }

    private validateSignature(license: LicenseData): boolean {
        if (!this.sharedSecret) return true;

        const payload = JSON.stringify({
            tenantId: license.tenantId,
            planCode: license.planCode,
            status: license.status,
            validUntil: license.validUntil,
            gracePeriodEnd: license.gracePeriodEnd,
            features: license.features,
            limits: license.limits,
            issuedAt: license.issuedAt,
            version: license.version
        });

        const expectedSignature = crypto
            .createHmac('sha256', this.sharedSecret)
            .update(payload)
            .digest('hex');

        return license.signature === expectedSignature;
    }

    public validate(): LicenseValidationResult {
        const license = this.localLicense;

        if (!license) {
            return {
                valid: false,
                status: 'EXPIRED',
                readOnly: false,
                reason: 'No license installed',
                offlineMode: this.isOffline
            };
        }

        const now = new Date();
        const validUntil = new Date(license.validUntil);
        const graceEnd = license.gracePeriodEnd ? new Date(license.gracePeriodEnd) : null;

        if (license.status === 'CANCELLED') {
            return {
                valid: false,
                status: 'CANCELLED',
                readOnly: false,
                reason: 'Subscription cancelled',
                offlineMode: this.isOffline
            };
        }

        if (license.status === 'SUSPENDED') {
            return {
                valid: false,
                status: 'SUSPENDED',
                readOnly: false,
                reason: 'Account suspended',
                offlineMode: this.isOffline
            };
        }

        if (license.status === 'ACTIVE') {
            if (now < validUntil) {
                const plan = PLANS[license.planCode];
                return {
                    valid: true,
                    status: 'ACTIVE',
                    readOnly: false,
                    plan,
                    features: plan.features.filter(f => f.included).map(f => f.name),
                    limits: license.limits,
                    offlineMode: this.isOffline
                };
            }

            if (graceEnd && now < graceEnd) {
                const plan = PLANS[license.planCode];
                return {
                    valid: true,
                    status: 'GRACE_PERIOD',
                    readOnly: false,
                    reason: `Grace period active until ${graceEnd.toISOString()}`,
                    gracePeriodEnd: graceEnd,
                    plan,
                    features: plan.features.filter(f => f.included).map(f => f.name),
                    limits: license.limits,
                    offlineMode: this.isOffline
                };
            }

            const plan = PLANS[license.planCode];
            return {
                valid: false,
                status: 'EXPIRED',
                readOnly: true,
                reason: 'Subscription expired - read-only mode',
                plan,
                features: plan.features.filter(f => f.included).map(f => f.name),
                limits: license.limits,
                offlineMode: this.isOffline
            };
        }

        if (license.status === 'GRACE_PERIOD') {
            if (graceEnd && now < graceEnd) {
                const plan = PLANS[license.planCode];
                return {
                    valid: true,
                    status: 'GRACE_PERIOD',
                    readOnly: false,
                    reason: `Grace period until ${graceEnd.toISOString()}`,
                    gracePeriodEnd: graceEnd,
                    plan,
                    features: plan.features.filter(f => f.included).map(f => f.name),
                    limits: license.limits,
                    offlineMode: this.isOffline
                };
            }

            const plan = PLANS[license.planCode];
            return {
                valid: false,
                status: 'EXPIRED',
                readOnly: true,
                reason: 'Grace period expired - read-only mode',
                plan,
                features: plan.features.filter(f => f.included).map(f => f.name),
                limits: license.limits,
                offlineMode: this.isOffline
            };
        }

        if (license.status === 'EXPIRED') {
            const plan = PLANS[license.planCode];
            return {
                valid: false,
                status: 'EXPIRED',
                readOnly: true,
                reason: 'Subscription expired - read-only mode',
                plan,
                features: plan.features.filter(f => f.included).map(f => f.name),
                limits: license.limits,
                offlineMode: this.isOffline
            };
        }

        return {
            valid: false,
            status: 'EXPIRED',
            readOnly: false,
            reason: 'Unknown license status',
            offlineMode: this.isOffline
        };
    }

    public setOfflineMode(offline: boolean): void {
        this.isOffline = offline;
        this.emit('offlineModeChanged', offline);
    }

    public startPeriodicCheck(onlineCheckFn: () => Promise<boolean>): void {
        this.licenseCheckInterval = setInterval(async () => {
            const online = await onlineCheckFn();
            this.setOfflineMode(!online);
        }, OFFLINE_CHECK_INTERVAL);
    }

    public stopPeriodicCheck(): void {
        if (this.licenseCheckInterval) {
            clearInterval(this.licenseCheckInterval);
            this.licenseCheckInterval = null;
        }
    }

    public getLicense(): LicenseData | null {
        return this.localLicense;
    }

    public getStatus(): { hasLicense: boolean; status: SubscriptionStatus | null; readOnly: boolean; offline: boolean } {
        const validation = this.validate();
        return {
            hasLicense: !!this.localLicense,
            status: validation.status,
            readOnly: validation.readOnly,
            offline: validation.offlineMode
        };
    }

    public clearLicense(): void {
        localStorage.removeItem('amisimedos_license');
        this.localLicense = null;
        this.emit('cleared');
    }

    public checkFeature(feature: string): boolean {
        const validation = this.validate();
        return validation.features?.includes(feature) || false;
    }

    public checkLimit(limitType: keyof LicenseData['limits'], currentValue: number): { allowed: boolean; remaining: number } {
        const validation = this.validate();
        const limit = validation.limits?.[limitType];
        
        if (limit === undefined || limit === -1) {
            return { allowed: true, remaining: -1 };
        }

        if (validation.readOnly) {
            return { allowed: false, remaining: 0 };
        }

        const remaining = limit - currentValue;
        return {
            allowed: remaining >= 0,
            remaining: Math.max(0, remaining)
        };
    }
}

export const licenseManager = LicenseManager.getInstance();