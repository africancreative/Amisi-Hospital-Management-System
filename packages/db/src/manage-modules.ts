import { PrismaClient } from '../generated/control-client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const controlDb = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    if (!command || command === 'help') {
        console.log(`
Amisi Module Management CLI (Database Scope)
Usage:
  npx tsx src/manage-modules.ts list-modules
  npx tsx src/manage-modules.ts list-tenants
  npx tsx src/manage-modules.ts enable <tenantId> <moduleCode>
  npx tsx src/manage-modules.ts disable <tenantId> <moduleCode>
  npx tsx src/manage-modules.ts suspend <tenantId> <reason>
  npx tsx src/manage-modules.ts reactivate <tenantId>
  npx tsx src/manage-modules.ts seed
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
                include: { tenantModules: true }
            });
            tenants.forEach((t: any) => {
                const modules = t.tenantModules.filter((e: any) => e.isEnabled).map((e: any) => e.moduleId).join(', ');
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

        if (command === 'suspend') {
            const [_, tenantId, ...reasonParts] = args;
            const reason = reasonParts.join(' ') || 'Administrative suspension';

            await controlDb.tenant.update({
                where: { id: tenantId },
                data: {
                    status: 'suspended' as any,
                    suspensionReason: reason,
                    suspendedAt: new Date()
                }
            });
            console.log(`🔒 Tenant ${tenantId} SUSPENDED. Reason: ${reason}`);
        }

        if (command === 'reactivate') {
            const [_, tenantId] = args;
            await controlDb.tenant.update({
                where: { id: tenantId },
                data: {
                    status: 'active' as any,
                    suspensionReason: null,
                    suspendedAt: null
                }
            });
            console.log(`🔓 Tenant ${tenantId} REACTIVATED.`);
        }

        if (command === 'seed') {
            const modules = [
                // Core
                { code: 'TENANT_MGMT', name: 'Tenant Management' },
                { code: 'IAM', name: 'Identity & Access Control' },
                { code: 'PMI', name: 'Patient Master Index' },

                // Clinical
                { code: 'OPD', name: 'Outpatient Management' },
                { code: 'IPD', name: 'Inpatient Management' },
                { code: 'EMERGENCY', name: 'Emergency & Trauma' },
                { code: 'OT', name: 'Operating Theatre' },
                { code: 'ICU', name: 'ICU & Critical Care' },

                // Diagnostic
                { code: 'LIS', name: 'Laboratory Information' },
                { code: 'RIS', name: 'Radiology Information' },
                { code: 'PATHOLOGY', name: 'Pathology & Molecular' },

                // Pharmacy & Supply Chain
                { code: 'PHARMACY', name: 'Pharmacy Management' },
                { code: 'INVENTORY', name: 'Central Stores & Inventory' },
                { code: 'BIOMED', name: 'Biomedical Engineering' },

                // Research & Academic
                { code: 'CTMS', name: 'Clinical Trials Mgmt' },
                { code: 'IRB', name: 'Institutional Review Board' },
                { code: 'RESEARCH_DATA', name: 'Research Data Warehouse' },

                // Administrative & Finance
                { code: 'RCM', name: 'Billing & Revenue Cycle' },
                { code: 'ACCOUNTING', name: 'Financial Accounting' },
                { code: 'HR', name: 'HR & Staff Management' },

                // Infrastructure & Support
                { code: 'HOUSEKEEPING', name: 'Housekeeping & EVS' },
                { code: 'SECURITY', name: 'Security Management' },
                { code: 'TRANSPORT', name: 'Ambulance & Transport' },

                // Governance & Compliance
                { code: 'AUDIT', name: 'Audit & Logging Engine' },
                { code: 'RISK_MGMT', name: 'Risk & Incident Mgmt' },
                { code: 'REGULATORY', name: 'Regulatory Compliance' },
            ];

            for (const m of modules) {
                await controlDb.module.upsert({
                    where: { code: m.code },
                    update: { name: m.name },
                    create: m
                });
            }
            console.log('✅ Comprehensive module registry seeded successfully.');
        }

    } catch (error: any) {
        console.error('Error:', error.message);
    } finally {
        await controlDb.$disconnect();
    }
}

main();
