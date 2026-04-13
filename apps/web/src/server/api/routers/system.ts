import { z } from 'zod';
import { router, superAdminProcedure } from '@/server/trpc/trpc';
import { getControlDb, DeploymentTier } from '@amisimedos/db/client';
import { revalidatePath } from 'next/cache';

/**
 * System/Platform Administration Router
 * Restricted to SuperAdmins (SAs) only.
 */
export const systemRouter = router({
    listTenants: superAdminProcedure.query(async () => {
        const db = getControlDb();
        return db.tenant.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { entitlements: true }
                }
            }
        });
    }),

    getTenant: superAdminProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            const db = getControlDb();
            return db.tenant.findUnique({
                where: { id: input.id },
                include: {
                    entitlements: {
                        include: { module: true }
                    }
                }
            });
        }),

    toggleTenantStatus: superAdminProcedure
        .input(z.object({ 
            id: z.string(), 
            status: z.enum(['active', 'suspended']),
            reason: z.string().optional()
        }))
        .mutation(async ({ input }) => {
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

    updateTenantModules: superAdminProcedure
        .input(z.object({
            tenantId: z.string(),
            moduleIds: z.array(z.string())
        }))
        .mutation(async ({ input }) => {
            const db = getControlDb();
            
            // 1. Clear existing generic entitlements for strict sync
            await db.tenantModule.deleteMany({
                where: { tenantId: input.tenantId }
            });

            // 2. Create new entitlements
            await db.tenantModule.createMany({
                data: input.moduleIds.map(moduleId => ({
                    tenantId: input.tenantId,
                    moduleId,
                    isEnabled: true
                }))
            });

            // 3. Update the legacy JSON field for backward compatibility
            const modules = await db.module.findMany({
                where: { id: { in: input.moduleIds } }
            });
            const enabledModulesMap: Record<string, boolean> = {};
            modules.forEach(m => enabledModulesMap[m.code.toLowerCase()] = true);

            await db.tenant.update({
                where: { id: input.tenantId },
                data: { enabledModules: enabledModulesMap as any }
            });

            revalidatePath('/admin/hospitals');
            return { success: true };
        }),

    onboardTenant: superAdminProcedure
        .input(z.object({
            name: z.string().min(3),
            slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
            region: z.string(),
            tier: z.nativeEnum(DeploymentTier),
            dbUrl: z.string().optional(),
            selectedModuleIds: z.array(z.string())
        }))
        .mutation(async ({ input }) => {
            // Re-use logic from system-actions for consistency
            const db = getControlDb();
            
            // Resolve modules to get their codes
            const modules = await db.module.findMany({
                where: { id: { in: input.selectedModuleIds } }
            });

            const enabledModulesMap: Record<string, boolean> = {};
            modules.forEach(m => enabledModulesMap[m.code.toLowerCase()] = true);

            // Trigger Provisioning
            // Dynamic import to prevent Node.js modules from leaking into the bundle
            const { provisionTenant } = await import('@amisimedos/db/management' as any);
            
            const result = await provisionTenant(
                input.name,
                input.slug,
                input.region,
                input.dbUrl || '', // provisionTenant will auto-generate if empty later in the flow if configured, but here we expect the URL usually.
                input.tier,
                {}, // settings
                enabledModulesMap
            );

            // Also create the Module Entitlements (TenantModule records)
            // provisionTenant currently handles the Tenant record and some initial setup
            // but we want to ensure TenantModule records exist for the new UI.
            const tenant = await db.tenant.findUnique({ where: { slug: input.slug } });
            if (tenant) {
              await db.tenantModule.createMany({
                  data: input.selectedModuleIds.map(moduleId => ({
                      tenantId: tenant.id,
                      moduleId,
                      isEnabled: true
                  }))
              });
            }

            revalidatePath('/admin/hospitals');
            return { success: true, tenant };
        }),

    listAllModules: superAdminProcedure.query(async () => {
        const db = getControlDb();
        return db.module.findMany({ orderBy: { name: 'asc' } });
    })
});
