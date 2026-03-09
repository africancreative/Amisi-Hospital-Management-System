import { ControlClient, TenantClient, Decimal } from './index';
import * as dotenv from 'dotenv';

dotenv.config();

async function seedAll() {
    console.log('Starting global tenant seeding...');
    const controlDb = new ControlClient();

    // 1. Get all active tenants
    const tenants = await controlDb.tenant.findMany({
        where: { status: 'active' }
    });

    console.log(`Found ${tenants.length} active tenants.`);

    for (const tenant of tenants) {
        console.log(`\n--- Seeding Tenant: ${tenant.name} (${tenant.slug}) ---`);

        const tenantDb = new TenantClient({
            datasources: {
                db: {
                    url: tenant.dbUrl
                }
            }
        });

        const dummyUsers = [
            {
                employeeId: `ADMIN-${tenant.slug}`,
                firstName: 'System',
                lastName: 'Administrator',
                email: `admin@${tenant.slug}.amisigenuine.com`,
                passwordHash: '@Admin123',
                role: 'ADMIN' as const,
                department: 'Administration',
                baseSalary: new Decimal(5000),
                status: 'active'
            },
            {
                employeeId: `DOC-${tenant.slug}`,
                firstName: 'Senior',
                lastName: 'Doctor',
                email: `doctor@${tenant.slug}.amisigenuine.com`,
                passwordHash: '@Doctor123',
                role: 'DOCTOR' as const,
                department: 'Clinical',
                baseSalary: new Decimal(4500),
                status: 'active'
            },
            {
                employeeId: `NURSE-${tenant.slug}`,
                firstName: 'Head',
                lastName: 'Nurse',
                email: `nurse@${tenant.slug}.amisigenuine.com`,
                passwordHash: '@Nurse123',
                role: 'NURSE' as const,
                department: 'Nursing',
                baseSalary: new Decimal(2500),
                status: 'active'
            },
            {
                employeeId: `ACC-${tenant.slug}`,
                firstName: 'Finance',
                lastName: 'Manager',
                email: `accountant@${tenant.slug}.amisigenuine.com`,
                passwordHash: '@Finance123',
                role: 'ACCOUNTANT' as const,
                department: 'Finance',
                baseSalary: new Decimal(3000),
                status: 'active'
            },
            {
                employeeId: `PHARM-${tenant.slug}`,
                firstName: 'Chief',
                lastName: 'Pharmacist',
                email: `pharmacist@${tenant.slug}.amisigenuine.com`,
                passwordHash: '@Pharm123',
                role: 'PHARMACIST' as const,
                department: 'Pharmacy',
                baseSalary: new Decimal(3200),
                status: 'active'
            },
            {
                employeeId: `LAB-${tenant.slug}`,
                firstName: 'Lab',
                lastName: 'Technician',
                email: `lab@${tenant.slug}.amisigenuine.com`,
                passwordHash: '@Lab123',
                role: 'LAB_TECH' as const,
                department: 'Laboratory',
                baseSalary: new Decimal(2800),
                status: 'active'
            },
            {
                employeeId: `HR-${tenant.slug}`,
                firstName: 'HR',
                lastName: 'Director',
                email: `hr@${tenant.slug}.amisigenuine.com`,
                passwordHash: '@HR123',
                role: 'HR' as const,
                department: 'Human Resources',
                baseSalary: new Decimal(3000),
                status: 'active'
            }
        ];

        for (const user of dummyUsers) {
            try {
                await tenantDb.employee.upsert({
                    where: { employeeId: user.employeeId },
                    update: {
                        email: user.email,
                        status: 'active'
                    },
                    create: user
                });
                console.log(`  - Seeded/Updated user: ${user.email}`);
            } catch (err: any) {
                console.error(`  - Error seeding user ${user.email}:`, err.message);
            }
        }
    }

    console.log('\nGlobal seeding completed.');
    process.exit(0);
}

seedAll().catch(err => {
    console.error('Global seed error:', err);
    process.exit(1);
});
