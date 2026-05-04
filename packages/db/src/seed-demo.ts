import { ControlClient, TenantClient, Decimal, hashPassword } from './index';

async function seed() {
    console.log('Starting demo seed...');
    const controlDb = new ControlClient();

    console.log('--- SEEDING CONTROL PLANE ---');

    // 1. Ensure Tenant Exists
    const tenantId = 'demo-hospital-id';
    const tenantSlug = 'amisi-premier';
    console.log(`Checking for tenant: ${tenantId}...`);
    
    // Check if tenant exists by slug first to avoid conflicts
    const existingTenant = await controlDb.tenant.findFirst({
        where: { OR: [{ id: tenantId }, { slug: tenantSlug }] }
    });
    
    let tenant;
    if (existingTenant) {
        // Update existing tenant
        tenant = await controlDb.tenant.update({
            where: { id: existingTenant.id },
            data: {
                id: tenantId,
                name: 'Amisi Premier Hospital',
                slug: tenantSlug,
                dbUrl: process.env.LOCAL_EDGE_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/amisi_tenant',
                encryptionKeyReference: 'demo-key-ref',
                region: 'East Africa',
                status: 'active',
                enabledModules: {
                    EHR: true,
                    BILLING: true,
                    LAB: true,
                    PHARMACY: true,
                    ACCOUNTING: true,
                    HR: true
                }
            }
        });
    } else {
        // Create new tenant
        tenant = await controlDb.tenant.create({
            data: {
                id: tenantId,
                name: 'Amisi Premier Hospital',
                slug: tenantSlug,
                dbUrl: process.env.LOCAL_EDGE_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/amisi_tenant',
                encryptionKeyReference: 'demo-key-ref',
                region: 'East Africa',
                status: 'active',
                enabledModules: {
                    EHR: true,
                    BILLING: true,
                    LAB: true,
                    PHARMACY: true,
                    ACCOUNTING: true,
                    HR: true
                }
            }
        });
    }
    console.log(`Tenant ${tenant.name} resolved.`);

    // 2. Ensure Modules are registered
    console.log('Registering modules and entitlements...');
    const modules = [
        { code: 'EHR', name: 'Electronic Health Records', basePrice: new Decimal(100) },
        { code: 'BILLING', name: 'Financial & Billing', basePrice: new Decimal(50) },
        { code: 'LAB', name: 'Laboratory Information', basePrice: new Decimal(75) },
        { code: 'PHARMACY', name: 'Pharmacy & Inventory', basePrice: new Decimal(75) },
        { code: 'ACCOUNTING', name: 'IFRS Accounting', basePrice: new Decimal(80) },
        { code: 'HR', name: 'Human Resources', basePrice: new Decimal(60) }
    ];

    for (const m of modules) {
        const mod = await controlDb.module.upsert({
            where: { code: m.code },
            update: { name: m.name, basePrice: m.basePrice },
            create: { code: m.code, name: m.name, basePrice: m.basePrice }
        });

        await controlDb.tenantModule.upsert({
            where: { tenantId_moduleId: { tenantId: tenant.id, moduleId: mod.id } },
            update: { isEnabled: true },
            create: { tenantId: tenant.id, moduleId: mod.id, isEnabled: true }
        });
    }

    console.log('Control Plane seeded successfully.');

    console.log('--- SEEDING TENANT DATA ---');
    const tenantDb = new TenantClient({
        datasources: {
            db: {
                url: tenant.dbUrl
            }
        }
    });

    // 3. Hospital Settings
    console.log('Updating hospital settings...');
    await tenantDb.hospitalSettings.upsert({
        where: { id: 'default-settings' },
        update: {},
        create: {
            id: 'default-settings',
            hospitalName: 'Amisi Premier Hospital',
            address: '123 Medical Plaza, Nairobi',
            phone: '+254 700 000 000',
            detailedAddress: 'Block C, 4th Floor, Healthcare District',
            taxId: 'KRA-PIN-2024-HMS',
            marketingSlogan: 'Excellence in Digital Healthcare',
            contactEmail: 'info@amisi-premier.amisigenuine.com',
            ehrEnabled: true,
            billingEnabled: true,
            labEnabled: true,
            pharmacyEnabled: true,
            hrEnabled: true
        }
    });

    // 4. Seeding Staff (Employees)
    console.log('Seeding employees...');
    const staff = [
        {
            employeeId: `ADMIN-${tenant.slug}`,
            firstName: 'Amisi',
            lastName: 'Amoi',
            email: 'admin@amisi-premier.amisigenuine.com',
            passwordHash: await hashPassword('@Admin123'),
            role: 'ADMIN',
            department: 'Administration',
            baseSalary: new Decimal(5000),
            permissions: ['ALL']
        },
        {
            employeeId: `DOC-${tenant.slug}`,
            firstName: 'Sarah',
            lastName: 'Amisi',
            email: 'doctor@amisi-premier.amisigenuine.com',
            passwordHash: await hashPassword('@Admin123'),
            role: 'DOCTOR',
            department: 'Clinical',
            baseSalary: new Decimal(4500)
        },
        {
            employeeId: `NURSE-${tenant.slug}`,
            firstName: 'Joy',
            lastName: 'Nurse',
            email: 'nurse@amisi-premier.amisigenuine.com',
            passwordHash: await hashPassword('@Admin123'),
            role: 'NURSE',
            department: 'Nursing',
            baseSalary: new Decimal(2500)
        },
        {
            employeeId: `ACC-${tenant.slug}`,
            firstName: 'Alex',
            lastName: 'Accountant',
            email: 'accountant@amisi-premier.amisigenuine.com',
            passwordHash: await hashPassword('@Admin123'),
            role: 'ACCOUNTANT',
            department: 'Finance',
            baseSalary: new Decimal(3000)
        }
    ];

    for (const s of staff) {
        await tenantDb.employee.upsert({
            where: { employeeId: s.employeeId },
            update: { 
                ...s as any,
                email: s.email, // Ensure email is updated if changed in seed
                status: 'active'
            },
            create: { 
                ...s as any,
                status: 'active'
            }
        });
    }

    // 5. Seeding Demo Patients
    console.log('Seeding patients...');
    const patientsCount = await tenantDb.patient.count();
    if (patientsCount === 0) {
        const patients = [
            {
                mrn: 'AM-2024-0001',
                firstName: 'John',
                lastName: 'Doe',
                dob: new Date('1985-05-15'),
                gender: 'Male'
            },
            {
                mrn: 'AM-2024-0002',
                firstName: 'Jane',
                lastName: 'Smith',
                dob: new Date('1992-11-20'),
                gender: 'Female'
            }
        ];

        for (const p of patients) {
            await tenantDb.patient.create({
                data: p
            });
        }
    }

    // 6. Base Chart of Accounts
    console.log('Seeding chart of accounts...');
    const accounts = [
        { code: '1010', name: 'Cash & Bank', type: 'ASSET' },
        { code: '1200', name: 'Accounts Receivable', type: 'ASSET' },
        { code: '4000', name: 'Patient Service Revenue', type: 'REVENUE' },
        { code: '5000', name: 'Salary & Wage Expense', type: 'EXPENSE' },
        { code: '5100', name: 'Tax Expense', type: 'EXPENSE' }
    ];

    for (const acc of accounts) {
        await tenantDb.account.upsert({
            where: { code: acc.code },
            update: acc,
            create: acc
        });
    }

    console.log('Tenant Data seeded successfully.');

    process.exit(0);
}

seed().catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
});
