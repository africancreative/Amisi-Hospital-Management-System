import { getControlDb, TenantClient, Decimal } from './index';

async function seedComprehensive() {
    console.log('--- Starting Comprehensive Seed ---');

    const controlDb = getControlDb();

    // 1. Seed System Admin
    console.log('Seeding System Admin...');
    await controlDb.systemAdmin.upsert({
        where: { email: 'admin@amisi.com' },
        update: {
            passwordHash: 'amisi-seed-salt:f741d605b4eff3bd40cb6f22f68515465064e5362482ee0fc4ac70b1519ccfdf05b5a61c4bc83090e7e18c87903f222dd4fb80b49e9d90d19595a64cf891234f'
        },
        create: {
            name: 'Amisi SuperAdmin',
            email: 'admin@amisi.com',
            passwordHash: 'amisi-seed-salt:f741d605b4eff3bd40cb6f22f68515465064e5362482ee0fc4ac70b1519ccfdf05b5a61c4bc83090e7e18c87903f222dd4fb80b49e9d90d19595a64cf891234f'
        }
    });

    console.log('Starting COMPREHENSIVE demo seed...');
    const db = new TenantClient({
        datasources: {
            db: {
                url: process.env.LOCAL_EDGE_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/amisi_tenant'
            }
        }
    });

    console.log('--- 1. SEEDING USERS FOR EVERY ROLE (28 ROLES) ---');
    const roles = [
        'DOCTOR', 'NURSE', 'PHARMACIST', 'LAB_TECH', 'ACCOUNTANT', 
        'HR_MANAGER', 'HR', 'ADMIN', 'MIDWIFE', 'ICU_NURSE', 
        'ONCOLOGY_NURSE', 'RADIOGRAPHER', 'RADIOLOGIST', 'RECEPTIONIST', 
        'SECURITY', 'CLEANER', 'DRIVER', 'PATHOLOGIST', 
        'PROCUREMENT_MANAGER', 'INVENTORY_CLERK', 'ADMISSIONS', 
        'NURSE_MANAGER', 'HIM_OFFICER', 'AUDITOR', 'SURGEON', 
        'ANESTHESIOLOGIST', 'OT_MANAGER', 'PATIENT_PORTAL'
    ];

    for (const role of roles) {
        const email = `${role.toLowerCase()}@amisi.com`;
        const employeeId = `EMP-${role}-001`.replace(/_/g, '-').toUpperCase();
        
        await db.employee.upsert({
            where: { email },
            update: { role: role as any, status: 'ACTIVE' },
            create: {
                employeeId,
                firstName: role.charAt(0) + role.slice(1).toLowerCase(),
                lastName: 'Staff',
                email,
                role: role as any,
                department: 'General',
                status: 'ACTIVE',
                baseSalary: new Decimal(3000),
                passwordHash: 'amisi-seed-salt:f741d605b4eff3bd40cb6f22f68515465064e5362482ee0fc4ac70b1519ccfdf05b5a61c4bc83090e7e18c87903f222dd4fb80b49e9d90d19595a64cf891234f',
                permissions: ['*']
            }
        });
        console.log(`- Seeded user: ${email} (Role: ${role})`);
    }

    console.log('--- 2. SEEDING TEST PATIENT: DANIEL AIMOI ---');
    const daniel = await db.patient.upsert({
        where: { mrn: 'AM-2024-DANIEL' },
        update: {},
        create: {
            mrn: 'AM-2024-DANIEL',
            firstName: 'Daniel',
            lastName: 'Aimoi',
            dob: new Date('1987-01-01'), // age 39 roughly
            gender: 'Male',
            email: 'amisiaimoi@gmail.com',
            phone: '+254700000000',
            address: 'Nairobi, Kenya',
        }
    });

    // 2.1 Vitals
    await db.vitals.create({
        data: {
            patientId: daniel.id,
            bloodPressure: '120/80',
            heartRate: 72,
            temperature: new Decimal(36.6),
            respiratoryRate: 16,
            spO2: 98,
            weight: new Decimal(82),
            height: new Decimal(178),
        }
    });

    // 2.2 Encounters
    const encounter = await db.encounter.create({
        data: {
            patientId: daniel.id,
            doctorName: 'Dr. Sarah Amisi',
            type: 'CONSULTATION',
            notes: 'Patient presents with mild fatigue. General checkup performed.',
            plan: 'Follow up in 3 months. Maintain healthy diet.',
        }
    });

    // 2.3 Lab Orders
    await db.labOrder.create({
        data: {
            patientId: daniel.id,
            encounterId: encounter.id,
            testPanelId: 'CBC + Lipid Profile',
            urgency: 'ROUTINE',
            status: 'COMPLETED',
            orderedById: 'DR_SARAH',
            results: {
                create: [
                    { biomarkerName: 'Hemoglobin', valueResult: '14.5', unit: 'g/dL', flag: 'NORMAL' },
                    { biomarkerName: 'Total Cholesterol', valueResult: '190', unit: 'mg/dL', flag: 'NORMAL' },
                ]
            }
        }
    });

    // 2.4 Pharmacy
    await db.prescription.create({
        data: {
            patientId: daniel.id,
            encounterId: encounter.id,
            orderedBy: 'Dr. Sarah Amisi',
            status: 'dispensed',
            items: {
                create: [
                    { drugName: 'Amlodipine', dosage: '5mg', frequency: 'Daily', duration: '30 days', quantity: 30 }
                ]
            }
        }
    });

    // 2.5 Finance
    await db.financialRecord.create({
        data: {
            patientId: daniel.id,
            encounterId: encounter.id,
            totalAmount: new Decimal(2500),
            balanceDue: new Decimal(0),
            status: 'paid',
            items: {
                create: [
                    { description: 'Consultation Fee', quantity: 1, unitPrice: new Decimal(1000), subtotal: new Decimal(1000) },
                    { description: 'Lab Panel', quantity: 1, unitPrice: new Decimal(1500), subtotal: new Decimal(1500) },
                ]
            }
        }
    });

    console.log('Comprehensive Seeding Completed Successfully.');
    process.exit(0);
}

seedComprehensive().catch(err => {
    console.error('Comprehensive Seed Error:', err);
    process.exit(1);
});
