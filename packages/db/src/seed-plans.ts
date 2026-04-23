import { getControlDb, Decimal } from './index';

async function seedPlans() {
    console.log('--- Seeding Subscription Plans ---');
    const controlDb = getControlDb();

    const plans = [
        // Essential Plan
        {
            name: 'Essential Plan',
            code: 'ESSENTIAL_MONTHLY',
            description: 'For Small Clinics & Dispensaries (50% Intro Offer)',
            price: new Decimal(24.50),
            billingCycle: 'MONTHLY' as const,
            features: JSON.stringify(['PATIENT_RECORDS', 'OPD', 'BASIC_BILLING', 'PHARMACY_BASIC', 'SCHEDULING', 'OFFLINE_MODE']),
        },
        {
            name: 'Essential Plan (Yearly)',
            code: 'ESSENTIAL_YEARLY',
            description: 'For Small Clinics & Dispensaries (50% Intro Offer)',
            price: new Decimal(245),
            billingCycle: 'YEARLY' as const,
            features: JSON.stringify(['PATIENT_RECORDS', 'OPD', 'BASIC_BILLING', 'PHARMACY_BASIC', 'SCHEDULING', 'OFFLINE_MODE']),
        },
        // Professional Plan
        {
            name: 'Professional Plan',
            code: 'PROFESSIONAL_MONTHLY',
            description: 'For Growing Hospitals (50% Intro Offer)',
            price: new Decimal(64.50),
            billingCycle: 'MONTHLY' as const,
            features: JSON.stringify(['PATIENT_RECORDS', 'OPD', 'FULL_BILLING', 'LAB_DIAGNOSTICS', 'IPD_WARD', 'PHARMACY_INTEGRATED', 'PATIENT_CHAT', 'INSURANCE_CLAIMS', 'CLOUD_HYBRID']),
        },
        {
            name: 'Professional Plan (Yearly)',
            code: 'PROFESSIONAL_YEARLY',
            description: 'For Growing Hospitals (50% Intro Offer)',
            price: new Decimal(645),
            billingCycle: 'YEARLY' as const,
            features: JSON.stringify(['PATIENT_RECORDS', 'OPD', 'FULL_BILLING', 'LAB_DIAGNOSTICS', 'IPD_WARD', 'PHARMACY_INTEGRATED', 'PATIENT_CHAT', 'INSURANCE_CLAIMS', 'CLOUD_HYBRID']),
        },
        // Enterprise Plan
        {
            name: 'Enterprise Plan',
            code: 'ENTERPRISE_MONTHLY',
            description: 'For Large & Multi-Specialty Hospitals (50% Intro Offer)',
            price: new Decimal(149.50),
            billingCycle: 'MONTHLY' as const,
            features: JSON.stringify(['ALL_FEATURES', 'MULTI_BRANCH', 'CUSTOM_WORKFLOW', 'REALTIME_ANALYTICS', 'AUDIT_LOGS', 'DEDICATED_SERVER', 'API_INTEGRATIONS']),
        },
        {
            name: 'Enterprise Plan (Yearly)',
            code: 'ENTERPRISE_YEARLY',
            description: 'For Large & Multi-Specialty Hospitals (50% Intro Offer)',
            price: new Decimal(1495),
            billingCycle: 'YEARLY' as const,
            features: JSON.stringify(['ALL_FEATURES', 'MULTI_BRANCH', 'CUSTOM_WORKFLOW', 'REALTIME_ANALYTICS', 'AUDIT_LOGS', 'DEDICATED_SERVER', 'API_INTEGRATIONS']),
        },
    ];

    for (const plan of plans) {
        await controlDb.plan.upsert({
            where: { code: plan.code },
            update: plan,
            create: plan,
        });
        console.log(`- Seeded plan: ${plan.name} (${plan.billingCycle})`);
    }

    console.log('Plans seeding completed.');
    process.exit(0);
}

seedPlans().catch(err => {
    console.error('Seed Plans Error:', err);
    process.exit(1);
});
