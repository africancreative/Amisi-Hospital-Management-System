const { PrismaClient: ControlClient } = require('./generated/control-client');
const { PrismaClient: TenantClient } = require('./generated/tenant-client');
const crypto = require('crypto');

// Use Neon Database for Control Plane
const NEON_URL = "postgresql://neondb_owner:npg_jrquU52ibhOs@ep-bold-boat-abd89fkh.eu-west-2.aws.neon.tech/neondb";
const DEMO_PASSWORD = 'Demo@1234';

async function hashPassword(password) {
    // Note: This must match the hashing algorithm in @amisimedos/db (PBKDF2)
    // For simplicity in this script, we'll use a placeholder or the same crypto logic
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

async function seed() {
    console.log('🚀 Starting Online Seeding for amisi-demo...');
    
    const controlDb = new ControlClient({
        datasources: { db: { url: NEON_URL } }
    });

    try {
        // 1. Create Tenant in Control Plane
        const slug = 'amisi-demo';
        console.log(`[Control] Creating/Updating tenant: ${slug}`);
        
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
                dbUrl: NEON_URL, // Using same cluster for demo
                encryptionKeyReference: 'demo-key',
                tier: 'HOSPITAL',
                region: 'Kenya',
                status: 'active',
                enabledModules: ['LAB', 'PHARMACY', 'INVENTORY', 'EHR', 'BILLING', 'WARD'],
            }
        });

        console.log(`[Control] Tenant confirmed: ${tenant.id}`);

        // 2. Connect to Tenant DB
        const tenantDb = new TenantClient({
            datasources: { db: { url: NEON_URL } }
        });

        const passwordHash = await hashPassword(DEMO_PASSWORD);

        const demoEmployees = [
            { email: 'dr.sarah@amisi.demo',       firstName: 'Dr. Sarah',  lastName: 'Wilson',  role: 'DOCTOR',       dept: 'OPD'            },
            { email: 'nrs.amina@amisi.demo',       firstName: 'Nrs. Amina', lastName: 'Ali',     role: 'NURSE',        dept: 'Triage'         },
            { email: 'phm.kelvin@amisi.demo',      firstName: 'Phm. Kelvin',lastName: 'Mwangi',  role: 'PHARMACIST',   dept: 'Pharmacy'       },
            { email: 'lab.kamau@amisi.demo',       firstName: 'Lab Tech',   lastName: 'Kamau',   role: 'LAB_TECH',     dept: 'Laboratory'     },
            { email: 'cashier.john@amisi.demo',    firstName: 'Cashier',    lastName: 'John',    role: 'RECEPTIONIST', dept: 'Billing'        },
            { email: 'admin.michael@amisi.demo',   firstName: 'Admin',      lastName: 'Michael', role: 'ADMIN',        dept: 'Administration' },
        ];

        console.log(`[Tenant] Seeding ${demoEmployees.length} employees...`);

        for (const emp of demoEmployees) {
            const employeeId = emp.email.split('@')[0].toUpperCase().replace('.', '-');
            await tenantDb.employee.upsert({
                where: { email: emp.email },
                update: {
                    passwordHash,
                    role: emp.role,
                    department: emp.dept,
                    status: 'ACTIVE',
                },
                create: {
                    employeeId,
                    firstName: emp.firstName,
                    lastName: emp.lastName,
                    email: emp.email,
                    passwordHash,
                    role: emp.role,
                    department: emp.dept,
                    status: 'ACTIVE',
                    baseSalary: 0,
                }
            });
        }

        // 3. Seed Patients
        const demoPatients = [
            { mrn: 'AM-4521', first: 'Robert',  last: 'Johnson', gender: 'M', dob: new Date('1972-05-15') },
            { mrn: 'AM-4522', first: 'Emily',   last: 'White',   gender: 'F', dob: new Date('1998-11-20') },
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

        console.log('✅ Online Seeding Complete! Hospital "amisi-demo" is now accessible.');
        console.log(`🔗 URL: http://localhost:3000/login (Enter: amisi-demo)`);
        console.log(`🔑 Password: ${DEMO_PASSWORD}`);

    } catch (e) {
        console.error('❌ Seeding Failed:', e);
    } finally {
        await controlDb.$disconnect();
    }
}

seed();
