import { z } from 'zod';
import { router, superAdminProcedure } from '@/server/trpc/trpc';
import { getControlDb } from '@amisimedos/db/client';
import { DeploymentTier, FacilityType } from '@amisimedos/constants';
import { revalidatePath } from 'next/cache';
import { hashPassword } from '@amisimedos/db/lib/crypto';

/**
 * System/Platform Administration Router
 * Restricted to SuperAdmins (SAs) only.
 */
export const systemRouter: any = router({
    // ─── Tenant Management ────────────────────────────────────────────
    listTenants: superAdminProcedure.query(async () => {
        const db = getControlDb();
        return db.tenant.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { entitlements: true } }
            }
        });
    }),

    getTenant: superAdminProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }: any) => {
            const db = getControlDb();
            return db.tenant.findUnique({
                where: { id: input.id },
                include: {
                    entitlements: { include: { module: true } },
                    configAuditLogs: { orderBy: { timestamp: 'desc' }, take: 50 }
                }
            });
        }),

    toggleTenantStatus: superAdminProcedure
        .input(z.object({
            id: z.string(),
            status: z.enum(['active', 'suspended']),
            reason: z.string().optional()
        }))
        .mutation(async ({ input }: any) => {
            const db = getControlDb();
            const tenant = await db.tenant.update({
                where: { id: input.id },
                data: {
                    status: input.status,
                    suspensionReason: input.status === 'suspended' ? input.reason : null,
                    suspendedAt: input.status === 'suspended' ? new Date() : null
                }
            });
            revalidatePath('/admin/hospitals');
            return tenant;
        }),

    // ─── Module Management ────────────────────────────────────────────
    updateTenantModules: superAdminProcedure
        .input(z.object({
            tenantId: z.string(),
            moduleIds: z.array(z.string()),
            moduleConfig: z.record(z.object({
                enabled: z.boolean(),
                version: z.string().default('1.0.0')
            })).optional()
        }))
        .mutation(async ({ input }: any) => {
            const db = getControlDb();
            const actor = { id: 'system', name: 'Admin', role: 'SUPER_ADMIN' };

            // 1. Clear existing entitlements
            await db.tenantModule.deleteMany({ where: { tenantId: input.tenantId } });

            // 2. Create new entitlements
            await db.tenantModule.createMany({
                data: input.moduleIds.map((moduleId: any) => {
                    return {
                        tenantId: input.tenantId,
                        moduleId,
                        isEnabled: true,
                    };
                }),
            });


            // 3. Update moduleConfig JSON
            if (input.moduleConfig) {
                await db.tenant.update({
                    where: { id: input.tenantId },
                    data: { moduleConfig: input.moduleConfig as any }
                });

                // Audit log
                await db.tenantConfigAuditLog.create({
                    data: {
                        tenantId: input.tenantId,
                        actorId: actor.id,
                        actorName: actor.name,
                        actorRole: actor.role,
                        action: 'MODULE_TOGGLE',
                        newValue: { moduleConfig: input.moduleConfig }
                    }
                });
            }

            revalidatePath('/admin/hospitals');
            return { success: true };
        }),

    listAllModules: superAdminProcedure.query(async () => {
        const db = getControlDb();
        return db.module.findMany({ orderBy: { name: 'asc' } });
    }),

    // ─── Tenant Configuration ─────────────────────────────────────────
    getTenantConfig: superAdminProcedure
        .input(z.object({ tenantId: z.string() }))
        .query(async ({ input }: any) => {
            const db = getControlDb();
            const tenant = await db.tenant.findUnique({
                where: { id: input.tenantId },
                select: {
                    id: true,
                    name: true,
                    facilityType: true,
                    moduleConfig: true,
                    workflowCustomization: true,
                    featureFlagOverrides: true,
                    complianceIsolation: true,
                    subscriptionQuotas: true,
                }
            });
            return tenant;
        }),

    updateTenantConfig: superAdminProcedure
        .input(z.object({
            tenantId: z.string(),
            facilityType: z.nativeEnum(FacilityType).optional(),
            moduleConfig: z.any().optional(),
            workflowCustomization: z.any().optional(),
            featureFlagOverrides: z.any().optional(),
            complianceIsolation: z.any().optional(),
            subscriptionQuotas: z.any().optional(),
        }))
        .mutation(async ({ input }: any) => {
            const db = getControlDb();
            const { tenantId, ...updateData } = input;

            const tenant = await db.tenant.update({
                where: { id: tenantId },
                data: updateData as any
            });

            // Audit log
            await db.tenantConfigAuditLog.create({
                data: {
                    tenantId,
                    actorId: 'system',
                    actorName: 'Admin',
                    actorRole: 'SUPER_ADMIN',
                    action: 'CONFIG_UPDATE',
                    newValue: updateData
                }
            });

            revalidatePath('/admin/hospitals');
            return tenant;
        }),

    // ─── Facility Type Presets ───────────────────────────────────────
    getFacilityPresets: superAdminProcedure.query(async () => {
        const presets = {
            CLINIC: ['MOD-PM', 'MOD-TQ', 'MOD-EC', 'MOD-BR', 'MOD-SA', 'MOD-SM', 'MOD-IC', 'MOD-AR'],
            PHARMACY: ['MOD-PM', 'MOD-PH', 'MOD-IS', 'MOD-BR', 'MOD-SA', 'MOD-SM', 'MOD-DM'],
            LAB: ['MOD-PM', 'MOD-LD', 'MOD-IS', 'MOD-BR', 'MOD-SA', 'MOD-SM', 'MOD-IO', 'MOD-DM'],
            SPECIALIST: ['MOD-PM', 'MOD-TQ', 'MOD-EC', 'MOD-SP', 'MOD-BR', 'MOD-SA', 'MOD-SM', 'MOD-RT', 'MOD-AR'],
            HOSPITAL: ['MOD-PM', 'MOD-TQ', 'MOD-EC', 'MOD-LD', 'MOD-PH', 'MOD-IS', 'MOD-BR', 'MOD-FA', 'MOD-HS', 'MOD-IC', 'MOD-RT', 'MOD-AR', 'MOD-MR', 'MOD-SA', 'MOD-IO', 'MOD-DM', 'MOD-SP', 'MOD-SM'],
        };
        return presets;
    }),

    // ─── Feature Flags ────────────────────────────────────────────────
    listFeatureFlags: superAdminProcedure.query(async () => {
        const db = getControlDb();
        return db.featureFlag.findMany({ orderBy: { flagId: 'asc' } });
    }),

    createFeatureFlag: superAdminProcedure
        .input(z.object({
            flagId: z.string(),
            scope: z.enum(['global', 'tenant', 'module']),
            moduleId: z.string().optional(),
            defaultValue: z.boolean().default(false),
            description: z.string().optional(),
        }))
        .mutation(async ({ input }: any) => {
            const db = getControlDb();
            return db.featureFlag.create({ data: input as any });
        }),

    updateTenantFeatureFlag: superAdminProcedure
        .input(z.object({
            tenantId: z.string(),
            flagId: z.string(),
            enabled: z.boolean(),
        }))
        .mutation(async ({ input }: any) => {
            const db = getControlDb();
            return db.tenantFeatureFlag.upsert({
                where: {
                    tenantId_flagId: { tenantId: input.tenantId, flagId: input.flagId }
                },
                update: { enabled: input.enabled },
                create: { tenantId: input.tenantId, flagId: input.flagId, enabled: input.enabled }
            });
        }),

    // ─── Audit Logs ──────────────────────────────────────────────────
    getConfigAuditLogs: superAdminProcedure
        .input(z.object({
            tenantId: z.string().optional(),
            limit: z.number().default(100),
        }))
        .query(async ({ input }: any) => {
            const db = getControlDb();
            return db.tenantConfigAuditLog.findMany({
                where: input.tenantId ? { tenantId: input.tenantId } : {},
                orderBy: { timestamp: 'desc' },
                take: input.limit,
                include: { tenant: { select: { name: true, slug: true } } }
            });
        }),

    // ─── Onboarding ───────────────────────────────────────────────────
    onboardTenant: superAdminProcedure
        .input(z.object({
            name: z.string().min(3),
            slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
            region: z.string(),
            tier: z.nativeEnum(DeploymentTier),
            facilityType: z.nativeEnum(FacilityType).default('CLINIC'),
            dbUrl: z.string().optional(),
            selectedModuleIds: z.array(z.string()),
            adminName: z.string().min(2),
            adminEmail: z.string().email(),
            adminPassword: z.string().min(8)
        }))
        .mutation(async ({ input }: any) => {
            const db = getControlDb();

            // Resolve modules to get their codes
            const modules = await db.module.findMany({
                where: { id: { in: input.selectedModuleIds } }
            });

            const enabledModulesMap: Record<string, boolean> = {};
            modules.forEach(m => enabledModulesMap[m.code.toLowerCase()] = true);

            // Build moduleConfig
            const moduleConfig: Record<string, { enabled: boolean; version: string }> = {};
            modules.forEach(m => {
                moduleConfig[m.code] = { enabled: true, version: '1.0.0' };
            });

            // Hash the admin password
            const passwordHash = await hashPassword(input.adminPassword);

            // Trigger Provisioning
            const { provisionTenant } = await import('@amisimedos/db/management');

            const result = await provisionTenant(
                input.name,
                input.slug,
                input.region,
                input.dbUrl || '',
                input.tier,
                {},
                enabledModulesMap,
                { name: input.adminName, email: input.adminEmail, passwordHash }
            );

            // Create Module Entitlements
            const tenant = await db.tenant.findUnique({ where: { slug: input.slug } });
            if (tenant) {
                await db.tenantModule.createMany({
                    data: input.selectedModuleIds.map((moduleId: any) => {
                        return {
                            tenantId: tenant.id,
                            moduleId,
                            isEnabled: true,
                        };
                    }),
                });

                // Update tenant with facility type and module config
                await db.tenant.update({
                    where: { id: tenant.id },
                    data: {
                        facilityType: input.facilityType,
                        moduleConfig: moduleConfig as any,
                        workflowCustomization: {
                            queue_logic: { triage_levels: ['Critical', 'Urgent', 'Routine'] },
                            billing_rules: { currency: 'USD', tax_rate: 0 },
                            staff_roles: {}
                        }
                    }
                });
            }

            revalidatePath('/admin/hospitals');
            return { success: true, tenant, adminPassword: input.adminPassword };
        }),
});
