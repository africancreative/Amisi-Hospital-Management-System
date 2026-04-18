import { TenantClient } from './index';

async function verify() {
    const tenantDb = new TenantClient({
        datasources: {
            db: {
                url: process.env.LOCAL_EDGE_DATABASE_URL || 'postgresql://postgres:Gr8tlove@localhost:5432/amisi_edge'
            }
        }
    });

    const employees = await tenantDb.employee.findMany();
    console.log('Employees found:', employees.map((e: any) => ({ name: `${e.firstName} ${e.lastName}`, email: e.email, role: e.role })));

    const patients = await tenantDb.patient.findMany();
    console.log('Patients found:', patients.map((p: any) => ({ name: `${p.firstName} ${p.lastName}`, dob: p.dob })));

    const settings = await tenantDb.hospitalSettings.findFirst();
    console.log('Hospital Settings:', settings ? settings.hospitalName : 'Not found');

    process.exit(0);
}

verify().catch(e => {
    console.error(e);
    process.exit(1);
});
