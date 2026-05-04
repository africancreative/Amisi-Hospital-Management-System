'use server';

import { getControlDb } from '@/lib/modules';
import { getTenantDb } from '@/lib/db';
import { hashPassword } from '@amisimedos/db';

/**
 * Demo credentials:
 *   Password for ALL users: Demo@1234
 *   Hospital slug:          amisi-demo
 *   Login URL:             /login  (enter hospital ID: amisi-demo)
 *
 * Users:
 *   dr.sarah@amisi.demo        → DOCTOR
 *   nrs.amina@amisi.demo       → NURSE
 *   phm.kelvin@amisi.demo      → PHARMACIST
 *   lab.kamau@amisi.demo       → LAB_TECH
 *   cashier.john@amisi.demo    → RECEPTIONIST
 *   admin.michael@amisi.demo   → ADMIN
 */

const DEMO_PASSWORD = 'Demo@1234';

export async function seedDemoData(slug: string): Promise<any> {
    const controlDb = getControlDb();

    // 1. Create or Update Tenant in Control DB
    const tenant = await controlDb.tenant.upsert({
        where: { slug },
        update: {
            status: 'active',
            enabledModules: ['LAB', 'PHARMACY', 'INVENTORY', 'EHR', 'BILLING', 'WARD'],
            tier: 'HOSPITAL'
        },
        create: {
            name: 'Amisi Demo Hospital',
            slug,
            dbUrl: process.env.LOCAL_EDGE_DATABASE_URL || process.env.DATABASE_URL || '',
            encryptionKeyReference: 'demo-key',
            tier: 'HOSPITAL',
            region: 'Kenya',
            status: 'active',
            enabledModules: ['LAB', 'PHARMACY', 'INVENTORY', 'EHR', 'BILLING', 'WARD'],
        }
    });

    // 2. Pre-hash the shared demo password
    const passwordHash = await hashPassword(DEMO_PASSWORD);

    // 3. Seed Employee Accounts in Tenant DB
    const tenantDb = await getTenantDb(tenant.id);

    const demoEmployees = [
        { email: 'dr.sarah@amisi.demo',       firstName: 'Dr. Sarah',  lastName: 'Wilson',  role: 'DOCTOR',       dept: 'OPD'            },
        { email: 'nrs.amina@amisi.demo',       firstName: 'Nrs. Amina', lastName: 'Ali',     role: 'NURSE',        dept: 'Triage'         },
        { email: 'phm.kelvin@amisi.demo',      firstName: 'Phm. Kelvin',lastName: 'Mwangi',  role: 'PHARMACIST',   dept: 'Pharmacy'       },
        { email: 'lab.kamau@amisi.demo',       firstName: 'Lab Tech',   lastName: 'Kamau',   role: 'LAB_TECH',     dept: 'Laboratory'     },
        { email: 'cashier.john@amisi.demo',    firstName: 'Cashier',    lastName: 'John',    role: 'RECEPTIONIST', dept: 'Billing'        },
        { email: 'admin.michael@amisi.demo',   firstName: 'Admin',      lastName: 'Michael', role: 'ADMIN',        dept: 'Administration' },
    ];

    for (const emp of demoEmployees) {
        const employeeId = emp.email.split('@')[0].toUpperCase().replace('.', '-');
        await tenantDb.employee.upsert({
            where: { email: emp.email },
            update: {
                passwordHash,
                role: emp.role as any,
                department: emp.dept,
                status: 'ACTIVE',
            },
            create: {
                employeeId,
                firstName: emp.firstName,
                lastName: emp.lastName,
                email: emp.email,
                passwordHash,
                role: emp.role as any,
                department: emp.dept,
                status: 'ACTIVE',
                baseSalary: 0,
            }
        });
    }

    // 4. Seed Demo Patients
    const demoPatients = [
        { mrn: 'AM-4521', first: 'Robert',  last: 'Johnson', gender: 'M', dob: new Date('1972-05-15') },
        { mrn: 'AM-4522', first: 'Emily',   last: 'White',   gender: 'F', dob: new Date('1998-11-20') },
        { mrn: 'AM-4523', first: 'James',   last: 'Ochieng', gender: 'M', dob: new Date('1985-03-08') },
    ];

    for (const p of demoPatients) {
        await tenantDb.patient.upsert({
            where: { mrn: p.mrn },
            update: {},
            create: {
                mrn: p.mrn,
                firstName: p.first,
                lastName: p.last,
                gender: p.gender,
                dob: p.dob,
            }
        });
    }

    return { success: true, tenantId: tenant.id, slug };
}
