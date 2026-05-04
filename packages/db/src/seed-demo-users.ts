import { getControlDb, getTenantDb, hashPassword } from './index';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const DEMO_PASSWORD = 'Demo@1234';
const SLUG = 'amisi-demo';

async function seedDemoUsers() {
    console.log('--- Seeding Demo Users ---');
    const controlDb = getControlDb();

    // 1. Ensure Tenant
    let tenant = await controlDb.tenant.findUnique({ where: { slug: SLUG } });
    if (!tenant) {
        console.log(`Creating tenant ${SLUG}...`);
        tenant = await controlDb.tenant.create({
            data: {
                name: 'Amisi Demo Hospital',
                slug: SLUG,
                dbUrl: process.env.LOCAL_EDGE_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/amisi_edge',
                encryptionKeyReference: 'demo-key',
                tier: 'HOSPITAL',
                region: 'Kenya',
                status: 'active',
                enabledModules: { EHR: true, BILLING: true, LAB: true, PHARMACY: true, INVENTORY: true, WARD: true }
            }
        });
    }

    const tenantDb = await getTenantDb(tenant.id);
    const passwordHash = await hashPassword(DEMO_PASSWORD);

    const users = [
        { email: 'admin.michael@amisi.demo', firstName: 'Michael', lastName: 'Admin', role: 'ADMIN', dept: 'Administration' },
        { email: 'dr.sarah@amisi.demo', firstName: 'Sarah', lastName: 'Doctor', role: 'DOCTOR', dept: 'OPD' },
        { email: 'nrs.amina@amisi.demo', firstName: 'Amina', lastName: 'Nurse', role: 'NURSE', dept: 'Triage' },
        { email: 'phm.kelvin@amisi.demo', firstName: 'Kelvin', lastName: 'Pharmacist', role: 'PHARMACIST', dept: 'Pharmacy' },
        { email: 'lab.kamau@amisi.demo', firstName: 'Kamau', lastName: 'Lab Tech', role: 'LAB_TECH', dept: 'Laboratory' },
        { email: 'cashier.john@amisi.demo', firstName: 'John', lastName: 'Receptionist', role: 'RECEPTIONIST', dept: 'Billing' },
    ];

    for (const u of users) {
        const employeeId = u.email.split('@')[0].toUpperCase().replace('.', '-');
        await tenantDb.employee.upsert({
            where: { email: u.email },
            update: { passwordHash, role: u.role as any, department: u.dept, status: 'ACTIVE' },
            create: {
                employeeId,
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
                passwordHash,
                role: u.role as any,
                department: u.dept,
                status: 'ACTIVE',
                baseSalary: 0
            }
        });
        console.log(`Seeded user: ${u.email}`);
    }

    console.log('Demo users seeded successfully.');
    process.exit(0);
}

seedDemoUsers().catch(e => {
    console.error(e);
    process.exit(1);
});
