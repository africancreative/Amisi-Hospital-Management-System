import { z } from 'zod';
import { router, superAdminProcedure } from '@/server/trpc/trpc';
import { getControlDb } from '@amisimedos/db/client';
import { DeploymentTier } from '@amisimedos/constants';
import { revalidatePath } from 'next/cache';
import { hashPassword } from '@amisimedos/db/lib/crypto';

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
            selectedModuleIds: z.array(z.string()),
            adminName: z.string().min(2),
            adminEmail: z.string().email(),
            adminPassword: z.string().min(8)
        }))
        .mutation(async ({ input }) => {
            const db = getControlDb();
            
            // Resolve modules to get their codes
            const modules = await db.module.findMany({
                where: { id: { in: input.selectedModuleIds } }
            });

            const enabledModulesMap: Record<string, boolean> = {};
            modules.forEach(m => enabledModulesMap[m.code.toLowerCase()] = true);

            // Hash the admin password
            const passwordHash = await hashPassword(input.adminPassword);

            // Trigger Provisioning with admin info
            const { provisionTenant } = await import('@amisimedos/db/management' as any);
            
            const result = await provisionTenant(
                input.name,
                input.slug,
                input.region,
                input.dbUrl || '',
                input.tier,
                {},
                enabledModulesMap,
                {
                    name: input.adminName,
                    email: input.adminEmail,
                    passwordHash
                }
            );

            // Also create the Module Entitlements (TenantModule records)
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
            // Return the plain password so Super Admin can share it with the Hospital Admin
            return { success: true, tenant, adminPassword: input.adminPassword };
        }),

    listAllModules: superAdminProcedure.query(async () => {
        const db = getControlDb();
        return db.module.findMany({ orderBy: { name: 'asc' } });
    })
});
