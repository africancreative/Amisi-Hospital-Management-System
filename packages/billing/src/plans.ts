export interface Plan {
    code: string;
    name: string;
    monthlyPrice: number;
    annualPrice: number;
    features: PlanFeature[];
    limits: PlanLimits;
    recommended: boolean;
}

export interface PlanFeature {
    name: string;
    included: boolean;
    description?: string;
}

export interface PlanLimits {
    users: number;
    patients: number;
    storageGB: number;
    apiCalls: number;
    smsPerMonth: number;
}

export const PLANS: Record<string, Plan> = {
    FREE: {
        code: 'FREE',
        name: 'Starter',
        monthlyPrice: 0,
        annualPrice: 0,
        features: [
            { name: 'Basic Patient Management', included: true },
            { name: 'Up to 100 patients', included: true },
            { name: '2 Users', included: true },
            { name: '1GB Storage', included: true },
            { name: 'Basic Reporting', included: true },
            { name: 'Email Support', included: true },
            { name: 'EHR Module', included: false },
            { name: 'Lab Integration', included: false },
            { name: 'Pharmacy Module', included: false },
            { name: 'Advanced Analytics', included: false },
            { name: 'Priority Support', included: false },
            { name: 'Custom Branding', included: false }
        ],
        limits: { users: 2, patients: 100, storageGB: 1, apiCalls: 1000, smsPerMonth: 0 },
        recommended: false
    },
    BASIC: {
        code: 'BASIC',
        name: 'Basic Care',
        monthlyPrice: 49,
        annualPrice: 470,
        features: [
            { name: 'Full Patient Management', included: true },
            { name: 'Up to 1,000 patients', included: true },
            { name: '10 Users', included: true },
            { name: '10GB Storage', included: true },
            { name: 'EHR Module', included: true },
            { name: 'Basic Reporting', included: true },
            { name: 'Email Support', included: true },
            { name: 'Lab Integration', included: false },
            { name: 'Pharmacy Module', included: false },
            { name: 'Advanced Analytics', included: false },
            { name: 'Priority Support', included: false },
            { name: 'Custom Branding', included: false }
        ],
        limits: { users: 10, patients: 1000, storageGB: 10, apiCalls: 10000, smsPerMonth: 50 },
        recommended: false
    },
    PRO: {
        code: 'PRO',
        name: 'Professional',
        monthlyPrice: 149,
        annualPrice: 1430,
        features: [
            { name: 'Full Patient Management', included: true },
            { name: 'Unlimited patients', included: true },
            { name: '25 Users', included: true },
            { name: '100GB Storage', included: true },
            { name: 'All Modules', included: true },
            { name: 'Lab Integration', included: true },
            { name: 'Pharmacy Module', included: true },
            { name: 'Advanced Reporting', included: true },
            { name: 'API Access', included: true },
            { name: 'Email & Chat Support', included: true },
            { name: 'Priority Support', included: false },
            { name: 'Custom Branding', included: false }
        ],
        limits: { users: 25, patients: -1, storageGB: 100, apiCalls: 50000, smsPerMonth: 200 },
        recommended: true
    },
    ENTERPRISE: {
        code: 'ENTERPRISE',
        name: 'Enterprise',
        monthlyPrice: 499,
        annualPrice: 4790,
        features: [
            { name: 'Everything in PRO', included: true },
            { name: 'Unlimited Users', included: true },
            { name: 'Unlimited Storage', included: true },
            { name: 'Custom Integrations', included: true },
            { name: 'Dedicated Account Manager', included: true },
            { name: '24/7 Priority Support', included: true },
            { name: 'Custom Branding', included: true },
            { name: 'SLA Guarantee', included: true },
            { name: 'On-premise Option', included: true },
            { name: 'HIPAA Compliance', included: true }
        ],
        limits: { users: -1, patients: -1, storageGB: -1, apiCalls: -1, smsPerMonth: -1 },
        recommended: false
    }
};

export type PlanCode = keyof typeof PLANS;