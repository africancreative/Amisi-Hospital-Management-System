const { getControlDb, TenantClient } = require('./packages/database/dist/index');

async function listAllSystemUsers() {
    console.log('--- AMISI HEALTHOS: COMPREHENSIVE NODE AUDIT ---');
    console.log('================================================\n');

    const controlDb = getControlDb();
    const tenants = await controlDb.tenant.findMany();

    if (tenants.length === 0) {
        console.log('No hospital nodes found in the Control Plane.');
        return;
    }

    for (const tenant of tenants) {
        console.log(`NODE: [${tenant.name.toUpperCase()}]`);
        console.log(`SLUG: ${tenant.slug}`);
        console.log(`REGION: ${tenant.region}`);
        console.log(`DB_URL: ${tenant.dbUrl.substring(0, 30)}...`);
        console.log('------------------------------------------------');

        try {
            const isolatedClient = new TenantClient({
                datasourceUrl: tenant.dbUrl
            });

            await isolatedClient.$connect();
            const employees = await isolatedClient.employee.findMany({
                select: { email: true, role: true, firstName: true, lastName: true }
            });

            if (employees.length === 0) {
                console.log('  (!) No users provisioned for this node.');
            } else {
                console.log('  USERS:');
                employees.forEach((emp, idx) => {
                    console.log(`  ${idx + 1}. ${emp.firstName} ${emp.lastName} <${emp.email}> (${emp.role})`);
                });
            }

            await isolatedClient.$disconnect();
        } catch (err) {
            console.error(`  [!] Error connecting to node database: ${err.message}`);
        }
        console.log('\n');
    }
}

listAllSystemUsers().catch(console.error);
