/**
 * AmisiMedOS — Cloud Multi-Tenant Seed
 * ─────────────────────────────────────────────────────────────────────────────
 * This script provisions the Neon control-plane DB with:
 *   1. Two SaaS system admins
 *   2. Subscription plans (Essential, Professional, Enterprise)
 *   3. Global platform settings
 *   4. Two demo tenants for multi-tenant routing tests:
 *       • amisi-demo   → Local edge DB (dev) / Neon amisimedos DB (cloud)
 *       • amisi-premier → Same edge DB (dev) / same cloud DB (cloud)
 *
 * Each tenant record stores dbUrl so slug-based routing resolves the correct DB.
 *
 * Usage:
 *   npx tsx src/seed-cloud.ts
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ControlClient, TenantClient, Decimal } from './index';
import { hashPassword } from './lib/crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env vars — walk up from packages/db/src to the repo root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../apps/web/.env.local'), override: false });

const NEON_URL = process.env.NEON_DATABASE_URL!;
const EDGE_URL = process.env.LOCAL_EDGE_DATABASE_URL!;

if (!NEON_URL) {
    console.error('[AmisiMedOS] NEON_DATABASE_URL is not set. Aborting.');
    process.exit(1);
}
if (!EDGE_URL) {
    console.error('[AmisiMedOS] LOCAL_EDGE_DATABASE_URL is not set. Aborting.');
    process.exit(1);
}

// ─── Tenant catalogue ────────────────────────────────────────────────────────
// In local dev:  both tenants share the same local postgres (different DBs would be ideal,
//                but for quick testing a single edge DB is fine).
// In cloud mode: set CLOUD_TENANT_URL env var to the Neon "amisimedos" DB URL;
//                the dbUrl stored in the control DB controls routing.
const CLOUD_TENANT_URL = process.env.CLOUD_TENANT_URL || EDGE_URL;

// Facility Type Presets - modules enabled by default per facility type
const FACILITY_PRESETS: Record<string, string[]> = {
    CLINIC:     ['MOD-PM', 'MOD-TQ', 'MOD-EC', 'MOD-BR', 'MOD-SA', 'MOD-SM', 'MOD-IC', 'MOD-AR'],
    PHARMACY:   ['MOD-PM', 'MOD-PH', 'MOD-IS', 'MOD-BR', 'MOD-SA', 'MOD-SM', 'MOD-DM'],
    LAB:        ['MOD-PM', 'MOD-LD', 'MOD-IS', 'MOD-BR', 'MOD-SA', 'MOD-SM', 'MOD-IO', 'MOD-DM'],
    SPECIALIST:  ['MOD-PM', 'MOD-TQ', 'MOD-EC', 'MOD-SP', 'MOD-BR', 'MOD-SA', 'MOD-SM', 'MOD-RT', 'MOD-AR'],
    HOSPITAL:   ['MOD-PM', 'MOD-TQ', 'MOD-EC', 'MOD-LD', 'MOD-PH', 'MOD-IS', 'MOD-BR', 'MOD-FA', 'MOD-HS', 'MOD-IC', 'MOD-RT', 'MOD-AR', 'MOD-MR', 'MOD-SA', 'MOD-IO', 'MOD-DM', 'MOD-SP', 'MOD-SM'],
};

const TENANTS = [
    {
        id:   'amisi-demo-id',
        name: 'Amisi Demo Hospital',
        slug: 'amisi-demo',
        dbUrl: CLOUD_TENANT_URL,  // routes here when /amisi-demo/* is accessed
        region: 'East Africa',
        tier: 'HOSPITAL' as const,
        facilityType: 'HOSPITAL' as const,
        hospitalName: 'Amisi Demo Hospital',
        contactEmail: 'admin@amisi-demo.amisigenuine.com',
        address: '1 Innovation Drive, Nairobi',
        phone: '+254 700 111 000',
        modules: FACILITY_PRESETS.HOSPITAL,
    },
    {
        id:   'amisi-premier-id',
        name: 'Amisi Premier Hospital',
        slug: 'amisi-premier',
        dbUrl: CLOUD_TENANT_URL,  // same cloud DB for demo; real prod would be isolated
        region: 'East Africa',
        tier: 'HOSPITAL' as const,
        facilityType: 'HOSPITAL' as const,
        hospitalName: 'Amisi Premier Hospital',
        contactEmail: 'admin@amisi-premier.amisigenuine.com',
        address: '123 Medical Plaza, Nairobi',
        phone: '+254 700 000 000',
        modules: FACILITY_PRESETS.HOSPITAL,
    },
];

// ─── Demo staff per tenant ───────────────────────────────────────────────────
function buildStaff(slug: string) {
    return [
        {
            employeeId: `ADMIN-${slug}`,
            firstName: 'Michael',
            lastName: 'Admin',
            email:     `admin.michael@${slug}.demo`,
            passwordHash: 'Demo@1234',
            role:        'ADMIN' as const,
            department:  'Administration',
            baseSalary:  new Decimal(5000),
            permissions: ['ALL'],
        },
        {
            employeeId: `DOC-${slug}`,
            firstName: 'Sarah',
            lastName:  'Doctor',
            email:      `dr.sarah@${slug}.demo`,
            passwordHash: 'Demo@1234',
            role:        'DOCTOR' as const,
            department:  'OPD',
            baseSalary:  new Decimal(4500),
            permissions: [],
        },
        {
            employeeId: `NURSE-${slug}`,
            firstName: 'Amina',
            lastName:  'Nurse',
            email:      `nrs.amina@${slug}.demo`,
            passwordHash: 'Demo@1234',
            role:        'NURSE' as const,
            department:  'Triage',
            baseSalary:  new Decimal(2500),
            permissions: [],
        },
        {
            employeeId: `PHARM-${slug}`,
            firstName: 'Kelvin',
            lastName:  'Pharmacist',
            email:      `phm.kelvin@${slug}.demo`,
            passwordHash: 'Demo@1234',
            role:        'PHARMACIST' as const,
            department:  'Pharmacy',
            baseSalary:  new Decimal(3200),
            permissions: [],
        },
        {
            employeeId: `LAB-${slug}`,
            firstName: 'Kamau',
            lastName:  'LabTech',
            email:      `lab.kamau@${slug}.demo`,
            passwordHash: 'Demo@1234',
            role:        'LAB_TECH' as const,
            department:  'Laboratory',
            baseSalary:  new Decimal(2800),
            permissions: [],
        },
        {
            employeeId: `CASHIER-${slug}`,
            firstName: 'John',
            lastName:  'Cashier',
            email:      `cashier.john@${slug}.demo`,
            passwordHash: 'Demo@1234',
            role:        'RECEPTIONIST' as const,
            department:  'Billing',
            baseSalary:  new Decimal(2200),
            permissions: [],
        },
    ];
}

// ─── Seed plan catalogue ─────────────────────────────────────────────────────
const PLANS = [
    {
        name: 'Essential Plan',         code: 'ESSENTIAL_MONTHLY',    price: new Decimal(24.50),
        billingCycle: 'MONTHLY' as const, maxPatients: 500, maxUsers: 10, maxBeds: 20,
        features: JSON.stringify(['PATIENT_RECORDS', 'OPD', 'BASIC_BILLING', 'PHARMACY_BASIC', 'SCHEDULING', 'OFFLINE_MODE']),
    },
    {
        name: 'Essential Plan (Yearly)', code: 'ESSENTIAL_YEARLY',    price: new Decimal(245),
        billingCycle: 'YEARLY' as const,  maxPatients: 500, maxUsers: 10, maxBeds: 20,
        features: JSON.stringify(['PATIENT_RECORDS', 'OPD', 'BASIC_BILLING', 'PHARMACY_BASIC', 'SCHEDULING', 'OFFLINE_MODE']),
    },
    {
        name: 'Professional Plan',       code: 'PROFESSIONAL_MONTHLY', price: new Decimal(64.50),
        billingCycle: 'MONTHLY' as const, maxPatients: 2000, maxUsers: 50, maxBeds: 100,
        features: JSON.stringify(['PATIENT_RECORDS', 'OPD', 'FULL_BILLING', 'LAB_DIAGNOSTICS', 'IPD_WARD', 'PHARMACY_INTEGRATED', 'PATIENT_CHAT', 'INSURANCE_CLAIMS', 'CLOUD_HYBRID']),
    },
    {
        name: 'Professional Plan (Yearly)', code: 'PROFESSIONAL_YEARLY', price: new Decimal(645),
        billingCycle: 'YEARLY' as const,  maxPatients: 2000, maxUsers: 50, maxBeds: 100,
        features: JSON.stringify(['PATIENT_RECORDS', 'OPD', 'FULL_BILLING', 'LAB_DIAGNOSTICS', 'IPD_WARD', 'PHARMACY_INTEGRATED', 'PATIENT_CHAT', 'INSURANCE_CLAIMS', 'CLOUD_HYBRID']),
    },
    {
        name: 'Enterprise Plan',         code: 'ENTERPRISE_MONTHLY',  price: new Decimal(149.50),
        billingCycle: 'MONTHLY' as const, maxPatients: 99999, maxUsers: 9999, maxBeds: 9999,
        features: JSON.stringify(['ALL_FEATURES', 'MULTI_BRANCH', 'CUSTOM_WORKFLOW', 'REALTIME_ANALYTICS', 'AUDIT_LOGS', 'DEDICATED_SERVER', 'API_INTEGRATIONS']),
    },
    {
        name: 'Enterprise Plan (Yearly)', code: 'ENTERPRISE_YEARLY',  price: new Decimal(1495),
        billingCycle: 'YEARLY' as const,  maxPatients: 99999, maxUsers: 9999, maxBeds: 9999,
        features: JSON.stringify(['ALL_FEATURES', 'MULTI_BRANCH', 'CUSTOM_WORKFLOW', 'REALTIME_ANALYTICS', 'AUDIT_LOGS', 'DEDICATED_SERVER', 'API_INTEGRATIONS']),
    },
];

// ─── 18 Platform Modules with full metadata ───────────────────────────
const MODULES = [
    // Core modules (all tenants)
    { code: 'MOD-PM', name: 'Patient Management', description: 'Registration, ID, Demographics', basePrice: new Decimal(0), dependencies: '[]', events: '["patient.registered", "patient.updated"]', permissions: '["PATIENT_READ", "PATIENT_WRITE"]' },
    { code: 'MOD-TQ', name: 'Triage & Queue Engine', description: 'Severity classification, Smart queue routing', basePrice: new Decimal(150), dependencies: '["MOD-PM"]', events: '["triage.completed", "queue.routed", "queue.wait_updated"]', permissions: '["TRIAGE_WRITE", "QUEUE_MANAGE"]' },
    { code: 'MOD-EC', name: 'EMR / Clinical', description: 'Consultations, Notes, Diagnoses, Prescriptions', basePrice: new Decimal(200), dependencies: '["MOD-PM", "MOD-TQ"]', events: '["clinical.consultation", "clinical.diagnosis_added", "clinical.prescription_issued"]', permissions: '["CLINICAL_WRITE", "DIAGNOSIS_WRITE", "PRESCRIPTION_WRITE"]' },

    // Clinical modules
    { code: 'MOD-LD', name: 'Lab & Diagnostics', description: 'Test orders, Results, Imaging integration', basePrice: new Decimal(120), dependencies: '["MOD-PM", "MOD-EC"]', events: '["lab.order_created", "lab.result_available", "lab.validated"]', permissions: '["LAB_ORDER", "LAB_RESULT_WRITE"]' },
    { code: 'MOD-PH', name: 'Pharmacy', description: 'Dispensing, Stock tracking, Drug interaction checks', basePrice: new Decimal(120), dependencies: '["MOD-PM", "MOD-EC"]', events: '["pharmacy.dispensed", "pharmacy.stock_low", "pharmacy.interaction_alert"]', permissions: '["PHARMACY_DISPENSE", "PHARMACY_STOCK_MANAGE"]' },
    { code: 'MOD-IS', name: 'Inventory & Supply Chain', description: 'Stock, Vendors, Expiry alerts', basePrice: new Decimal(80), dependencies: '["MOD-PH"]', events: '["inventory.stock_in", "inventory.expiry_alert", "inventory.reorder"]', permissions: '["INV_AUDIT", "INV_MANAGE"]' },
    { code: 'MOD-BR', name: 'Billing & Revenue', description: 'Itemized billing, Payments, Insurance claims', basePrice: new Decimal(100), dependencies: '["MOD-PM", "MOD-EC", "MOD-LD", "MOD-PH"]', events: '["billing.invoice_created", "billing.payment_posted", "billing.insurance_claim"]', permissions: '["BILLING_WRITE", "INSURANCE_CLAIM"]' },
    { code: 'MOD-FA', name: 'Finance & Accounting', description: 'Revenue tracking, Expenses, Reports', basePrice: new Decimal(90), dependencies: '["MOD-BR"]', events: '["finance.journal_posted", "finance.payroll_processed"]', permissions: '["LEDGER_VIEW", "PAYROLL_PROCESS"]' },

    // Administrative modules
    { code: 'MOD-HS', name: 'HR & Staff Management', description: 'Scheduling, Roles, Performance tracking', basePrice: new Decimal(70), dependencies: '[]', events: '["hr.employee_added", "hr.shift_assigned", "hr.leave_approved"]', permissions: '["HR_MANAGE", "PAYROLL_PROCESS"]' },
    { code: 'MOD-IC', name: 'Internal Communication', description: 'Messaging, Alerts, Patient-linked discussions', basePrice: new Decimal(50), dependencies: '["MOD-PM"]', events: '["chat.message_sent", "chat.alert_triggered"]', permissions: '["CHAT_SEND", "ALERT_MANAGE"]' },
    { code: 'MOD-RT', name: 'Referral & Transfer', description: 'Inter-facility transfers, Patient summaries', basePrice: new Decimal(80), dependencies: '["MOD-PM", "MOD-EC"]', events: '["referral.initiated", "referral.received", "transfer.completed"]', permissions: '["REFERRAL_WRITE", "TRANSFER_MANAGE"]' },

    // Analytics & Reporting
    { code: 'MOD-AR', name: 'Analytics & Reporting', description: 'Operational dashboards, Financial reports, Clinical insights', basePrice: new Decimal(100), dependencies: '["MOD-PM", "MOD-EC", "MOD-BR"]', events: '["analytics.report_generated", "analytics.dashboard_viewed"]', permissions: '["REPORTS_VIEW", "ANALYTICS_ACCESS"]' },
    { code: 'MOD-MR', name: 'Mobile & Rounds', description: 'Bedside care, Offline sync', basePrice: new Decimal(90), dependencies: '["MOD-EC", "MOD-PM"]', events: '["mobile.sync_completed", "mobile.rounds_started"]', permissions: '["MOBILE_ACCESS", "ROUNDS_WRITE"]' },

    // Security & Compliance
    { code: 'MOD-SA', name: 'Security & Audit', description: 'RBAC, Audit logs, Compliance tracking', basePrice: new Decimal(60), dependencies: '[]', events: '["security.login", "security.audit_log", "security.permission_changed"]', permissions: '["SECURITY_ADMIN", "AUDIT_VIEW"]' },
    { code: 'MOD-IO', name: 'Interoperability', description: 'FHIR APIs, External integrations', basePrice: new Decimal(110), dependencies: '["MOD-PM", "MOD-EC"]', events: '["fhir.patient_read", "fhir.resource_created"]', permissions: '["FHIR_API_ACCESS", "EXTERNAL_INTEGRATE"]' },
    { code: 'MOD-DM', name: 'Document Management', description: 'Reports, Scans, Attachments', basePrice: new Decimal(70), dependencies: '["MOD-EC"]', events: '["document.uploaded", "document.shared"]', permissions: '["DOC_UPLOAD", "DOC_MANAGE"]' },

    // Specialty modules
    { code: 'MOD-SP', name: 'Specialty Modules', description: 'Maternity, Pediatrics, ICU, Radiology', basePrice: new Decimal(150), dependencies: '["MOD-EC", "MOD-PM", "MOD-TQ"]', events: '["specialty.consultation", "specialty.icu_monitoring"]', permissions: '["SPECIALTY_ACCESS", "MATERNITY_WRITE", "ICU_WRITE"]' },
    { code: 'MOD-SM', name: 'SaaS Admin', description: 'Tenant onboarding, Subscription billing, Usage tracking', basePrice: new Decimal(0), dependencies: '["MOD-SA"]', events: '["saas.tenant_onboarded", "saas.subscription_changed"]', permissions: '["SAAS_ADMIN", "TENANT_MANAGE"]' },
];

// ─── Main ────────────────────────────────────────────────────────────────────
async function seedCloud() {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║     AmisiMedOS — Cloud Multi-Tenant Seed             ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');
    console.log(`  Control DB : ${NEON_URL.substring(0, 60)}...`);
    console.log(`  Tenant DB  : ${EDGE_URL.substring(0, 60)}...`);
    console.log('');

    const controlDb = new ControlClient();

    // ── 1. System Admins ────────────────────────────────────────────────────
    console.log('▸ [1/5] Seeding system administrators...');
    const admins = [
        { email: 'admin@amisigenuine.com', name: 'Platform Admin',      password: '@AmisiAdmin2026' },
        { email: 'amisi@amisigenuine.com', name: 'Amisi System Admin',  password: '@theVerge#2047'  },
    ];
    for (const a of admins) {
        const passwordHash = await hashPassword(a.password);
        await controlDb.systemAdmin.upsert({
            where:  { email: a.email },
            update: { name: a.name, passwordHash },
            create: { email: a.email, name: a.name, passwordHash },
        });
        console.log(`    ✔ ${a.email}`);
    }

    // ── 2. Subscription Plans ───────────────────────────────────────────────
    console.log('\n▸ [2/5] Seeding subscription plans...');
    for (const plan of PLANS) {
        await controlDb.plan.upsert({
            where:  { code: plan.code },
            update: plan,
            create: plan,
        });
        console.log(`    ✔ ${plan.name}`);
    }

    // ── 3. Global Platform Settings ─────────────────────────────────────────
    console.log('\n▸ [3/5] Seeding global platform settings...');
    await controlDb.globalSettings.upsert({
        where:  { id: 'singleton' },
        update: {},
        create: {
            id:             'singleton',
            platformName:   'AmisiMedOS',
            platformSlogan: 'Next-Gen Hospital Intelligence',
            heroTitle:      'Intelligent Healthcare, Everywhere',
            heroSubtitle:   'A cloud-native, multi-tenant hospital management platform built for Africa.',
            heroCTA:        'Request a Demo',
            showHero:       true,
            showFeatures:   true,
            feature1Title:  'FHIR R4 Interoperability',
            feature1Desc:   'Standards-based patient data exchange across all modules.',
            feature1Icon:   'stethoscope',
            feature2Title:  'Edge-Cloud Hybrid Sync',
            feature2Desc:   'Run offline at the hospital, sync to Neon cloud automatically.',
            feature2Icon:   'cloud',
            feature3Title:  'Role-Based Access Control',
            feature3Desc:   'Granular permissions for every clinical and administrative role.',
            feature3Icon:   'shield',
            paypalEnv:      'sandbox',
        },
    });
    console.log('    ✔ Global settings');

    // ── 4. Modules ──────────────────────────────────────────────────────────
    console.log('\n▸ [4/5] Registering platform modules (18 modules with metadata)...');
    const moduleRecords: Record<string, { id: string }> = {};
    for (const m of MODULES) {
        const mod = await controlDb.module.upsert({
            where:  { code: m.code },
            update: {
                name: m.name,
                description: m.description,
                basePrice: m.basePrice,
                dependencies: m.dependencies,
                events: m.events,
                permissions: m.permissions,
            },
            create: {
                code: m.code,
                name: m.name,
                description: m.description,
                basePrice: m.basePrice,
                dependencies: m.dependencies,
                events: m.events,
                permissions: m.permissions,
            },
        });
        moduleRecords[m.code] = mod;
        console.log(`    ✔ Module: ${m.name} (${m.code})`);
    }

    // ── 5. Tenants + Tenant DB seeding ──────────────────────────────────────
    console.log('\n▸ [5/5] Provisioning tenants + seeding tenant databases...');

    for (const t of TENANTS) {
        console.log(`\n  ─── Tenant: ${t.name} (/${t.slug}) ───`);

        // 5a. Build module config JSON from preset
        const moduleConfig: Record<string, { enabled: boolean; version: string }> = {};
        for (const m of MODULES) {
            moduleConfig[m.code] = {
                enabled: t.modules.includes(m.code),
                version: '1.0.0',
            };
        }

        // 5b. Upsert tenant record in control DB (check by slug to avoid conflicts)
        let tenant = await controlDb.tenant.findFirst({
            where: { slug: t.slug }
        });

        if (tenant) {
            // Update existing tenant
            tenant = await controlDb.tenant.update({
                where: { id: tenant.id },
                data: {
                    name: t.name,
                    dbUrl: t.dbUrl,
                    status: 'active',
                    facilityType: t.facilityType,
                    enabledModules: t.modules,
                    moduleConfig: moduleConfig,
                    workflowCustomization: {
                        queue_logic: { triage_levels: ['Critical', 'Urgent', 'Routine'], routing_rules: [] },
                        billing_rules: { currency: 'USD', tax_rate: 0, payment_methods: ['CASH', 'CARD', 'MPESA'] },
                        staff_roles: {},
                    },
                    complianceIsolation: { isolation_policy: 'logical', data_residency: t.region, byok_enabled: false },
                    subscriptionQuotas: { seat_limit: 50, storage_mb: 10000 },
                },
            });
        } else {
            // Create new tenant
            tenant = await controlDb.tenant.create({
                data: {
                    id:                   t.id,
                    name:                 t.name,
                    slug:                 t.slug,
                    dbUrl:                t.dbUrl,
                    encryptionKeyReference: 'demo-key-ref',
                    region:               t.region,
                    tier:                 t.tier,
                    facilityType:         t.facilityType,
                    status:               'active',
                    enabledModules:       t.modules,
                    moduleConfig:         moduleConfig,
                    workflowCustomization: {
                        queue_logic: { triage_levels: ['Critical', 'Urgent', 'Routine'], routing_rules: [] },
                        billing_rules: { currency: 'USD', tax_rate: 0, payment_methods: ['CASH', 'CARD', 'MPESA'] },
                        staff_roles: {},
                    },
                    complianceIsolation: { isolation_policy: 'logical', data_residency: t.region, byok_enabled: false },
                    subscriptionQuotas: { seat_limit: 50, storage_mb: 10000 },
                },
            });
        }
        console.log(`    ✔ Control DB record — slug: ${tenant.slug} (${t.facilityType})`);

        // 5c. Link all modules to this tenant
        for (const code of t.modules) {
            const mod = moduleRecords[code];
            if (!mod) continue;
            await controlDb.tenantModule.upsert({
                where:  { tenantId_moduleId: { tenantId: tenant.id, moduleId: mod.id } },
                update: { isEnabled: true },
                create: { tenantId: tenant.id, moduleId: mod.id, isEnabled: true },
            });
        }
        console.log(`    ✔ Module entitlements linked (${t.modules.length} modules)`);

        // 5c. Seed the tenant's own database
        const tenantDb = new TenantClient({ datasources: { db: { url: tenant.dbUrl } } });

        // Hospital settings
        await tenantDb.hospitalSettings.upsert({
            where:  { id: 'default-settings' },
            update: { hospitalName: t.hospitalName, contactEmail: t.contactEmail },
            create: {
                id:              'default-settings',
                hospitalName:    t.hospitalName,
                address:         t.address,
                phone:           t.phone,
                contactEmail:    t.contactEmail,
                marketingSlogan: 'Excellence in Digital Healthcare',
                ehrEnabled:      true,
                billingEnabled:  true,
                labEnabled:      true,
                pharmacyEnabled: true,
                hrEnabled:       true,
            },
        });
        console.log(`    ✔ Hospital settings`);

        // Staff
        const staff = buildStaff(t.slug);
        for (const s of staff) {
            const hash = await hashPassword(s.passwordHash);
            await tenantDb.employee.upsert({
                where:  { employeeId: s.employeeId },
                update: { email: s.email, status: 'ACTIVE' },
                create: { ...s, passwordHash: hash, status: 'ACTIVE' },
            });
        }
        console.log(`    ✔ ${staff.length} staff members seeded (password: Demo@1234)`);

        // Demo patients (only on first run)
        const count = await tenantDb.patient.count();
        if (count === 0) {
            const patients = [
                { mrn: `${t.slug.toUpperCase()}-P001`, firstName: 'John',   lastName: 'Doe',   dob: new Date('1985-05-15'), gender: 'Male'   },
                { mrn: `${t.slug.toUpperCase()}-P002`, firstName: 'Jane',   lastName: 'Smith', dob: new Date('1992-11-20'), gender: 'Female' },
                { mrn: `${t.slug.toUpperCase()}-P003`, firstName: 'Daniel', lastName: 'Aimoi', dob: new Date('1987-01-01'), gender: 'Male',
                    email: 'amisiaimoi@gmail.com', phone: '+254700000000', address: 'Nairobi, Kenya' },
            ];
            for (const p of patients) await tenantDb.patient.create({ data: p });
            console.log(`    ✔ ${patients.length} demo patients created`);
        } else {
            console.log(`    ○ Patients already exist (${count} records) — skipped`);
        }

        // Chart of accounts
        const accounts = [
            { code: '1010', name: 'Cash & Bank',             type: 'ASSET'   },
            { code: '1200', name: 'Accounts Receivable',      type: 'ASSET'   },
            { code: '4000', name: 'Patient Service Revenue',  type: 'REVENUE' },
            { code: '5000', name: 'Salary & Wage Expense',    type: 'EXPENSE' },
            { code: '5100', name: 'Tax Expense',              type: 'EXPENSE' },
        ];
        for (const acc of accounts) {
            await tenantDb.account.upsert({ where: { code: acc.code }, update: acc, create: acc });
        }
        console.log(`    ✔ Chart of accounts seeded`);
    }

    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║  Cloud seed complete!                                ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log('║  System Admin Logins (Neon Control DB)               ║');
    console.log('║    admin@amisigenuine.com  /  @AmisiAdmin2026        ║');
    console.log('║    amisi@amisigenuine.com  /  @theVerge#2047         ║');
    console.log('╠══════════════════════════════════════════════════════╣');
    console.log('║  Tenant: /amisi-demo   Staff password: Demo@1234     ║');
    console.log('║  Tenant: /amisi-premier  Staff password: Demo@1234   ║');
    console.log('╚══════════════════════════════════════════════════════╝\n');

    process.exit(0);
}

seedCloud().catch(err => {
    console.error('\n[AmisiMedOS] Cloud seed FAILED:', err);
    process.exit(1);
});
