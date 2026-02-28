import { PrismaClient } from '@prisma/client/control';

const controlDb = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command || command === 'help') {
        console.log(`
Amisi Module Management CLI
Usage:
  npx ts-node scripts/manage-modules.ts list-modules
  npx ts-node scripts/manage-modules.ts list-tenants
  npx ts-node scripts/manage-modules.ts enable <tenantId> <moduleCode>
  npx ts-node scripts/manage-modules.ts disable <tenantId> <moduleCode>
  npx ts-node scripts/manage-modules.ts seed
        `);
        return;
    }

    try {
        if (command === 'list-modules') {
            const modules = await controlDb.module.findMany();
            console.table(modules.map((m: any) => ({ id: m.id, code: m.code, name: m.name })));
        }

        if (command === 'list-tenants') {
            const tenants = await controlDb.tenant.findMany({
                include: { entitlements: { include: { module: true } } }
            });
            tenants.forEach((t: any) => {
                const modules = t.entitlements.filter((e: any) => e.isEnabled).map((e: any) => e.module.code).join(', ');
                console.log(`[${t.id}] ${t.name} - Enabled: ${modules || 'None'}`);
            });
        }

        if (command === 'enable') {
            const [_, tenantId, moduleCode] = args;
            const module = await controlDb.module.findUnique({ where: { code: moduleCode } });
            if (!module) throw new Error(`Module ${moduleCode} not found`);

            await controlDb.tenantModule.upsert({
                where: { tenantId_moduleId: { tenantId, moduleId: module.id } },
                update: { isEnabled: true },
                create: { tenantId, moduleId: module.id, isEnabled: true }
            });
            console.log(`✅ Module ${moduleCode} enabled for tenant ${tenantId}`);
        }

        if (command === 'disable') {
            const [_, tenantId, moduleCode] = args;
            const module = await controlDb.module.findUnique({ where: { code: moduleCode } });
            if (!module) throw new Error(`Module ${moduleCode} not found`);

            await controlDb.tenantModule.update({
                where: { tenantId_moduleId: { tenantId, moduleId: module.id } },
                data: { isEnabled: false }
            });
            console.log(`❌ Module ${moduleCode} disabled for tenant ${tenantId}`);
        }

        if (command === 'seed') {
            const modules = [
                { code: 'EHR', name: 'Electronic Health Records' },
                { code: 'BILLING', name: 'Billing & Invoicing' },
                { code: 'LAB', name: 'Laboratory Information' },
                { code: 'PHARMACY', name: 'Pharmacy Management' },
                { code: 'INVENTORY', name: 'Inventory & Stock' },
                { code: 'HR', name: 'HR & Payroll' },
                { code: 'ACCOUNTING', name: 'Financial Accounting' },
            ];

            for (const m of modules) {
                await controlDb.module.upsert({
                    where: { code: m.code },
                    update: {},
                    create: m
                });
            }
            console.log('✅ Base modules seeded successfully.');
        }

    } catch (error: any) {
        console.error('Error:', error.message);
    } finally {
        await controlDb.$disconnect();
    }
}

main();
