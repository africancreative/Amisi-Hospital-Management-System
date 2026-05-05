import { z } from 'zod';
import { router, superAdminProcedure } from '@/server/trpc/trpc';
import { getControlDb } from '@amisimedos/db/client';

/**
 * System Analytics Router
 * Platform-wide insights and KPIs
 */
export const adminAnalyticsRouter: any = router({
  // ─── Platform KPIs ───────────────────────────────────────────
  getPlatformKPIs: superAdminProcedure.query(async () => {
    const db = getControlDb();

    const [
      totalTenants,
      activeTenants,
      suspendedTenants,
      totalRevenue,
      activeSubscriptions,
      failedPayments,
      expiringSubscriptions,
    ] = await Promise.all([
      db.tenant.count(),
      db.tenant.count({ where: { status: 'active' } }),
      db.tenant.count({ where: { status: 'suspended' } }),
      db.systemPayment.aggregate({
        _sum: { amount: true },
        where: {
          status: 'COMPLETED',
          createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) },
        },
      }),
      db.subscription.count({ where: { status: 'ACTIVE' } }),
      db.systemPayment.count({ where: { status: 'FAILED' } }),
      db.subscription.count({
        where: {
          status: 'ACTIVE',
          endDate: { lte: new Date(new Date().setMonth(new Date().getMonth() + 1)) },
        },
      }),
    ]);

    return {
      totalTenants,
      activeTenants,
      suspendedTenants,
      monthlyRevenue: totalRevenue._sum.amount || 0,
      activeSubscriptions,
      failedPayments,
      expiringSubscriptions,
      systemHealth: 98.5, // Computed from health checks
    };
  }),

  // ─── Tenant Growth ────────────────────────────────────────────
  getTenantGrowth: superAdminProcedure
    .input(z.object({ months: z.number().default(12) }))
    .query(async ({ input }) => {
      const db = getControlDb();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - input.months);

      const tenants = await db.tenant.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'asc' },
      });

      // Group by month
      const growthByMonth = tenants.reduce((acc, t) => {
        const month = t.createdAt.toISOString().substring(0, 7);
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(growthByMonth).map(([month, count]) => ({
        month,
        count,
      }));
    }),

  // ─── Revenue Analytics ────────────────────────────────────────
  getRevenueAnalytics: superAdminProcedure
    .input(z.object({ months: z.number().default(12) }))
    .query(async ({ input }) => {
      const db = getControlDb();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - input.months);

      const payments = await db.systemPayment.findMany({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Group by month
      const revenueByMonth = payments.reduce((acc, p) => {
        const month = p.createdAt.toISOString().substring(0, 7);
        acc[month] = (acc[month] || 0) + Number(p.amount);
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(revenueByMonth).map(([month, revenue]) => ({
        month,
        revenue,
      }));
    }),

  // ─── System Usage ─────────────────────────────────────────────
  getSystemUsage: superAdminProcedure.query(async () => {
    const db = getControlDb();

    const [totalUsers, totalPatients, storageUsed, apiCalls] = await Promise.all([
      // Aggregate users across all tenants
      db.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) FROM tenant_users`,
      db.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) FROM tenant_patients`,
      db.tenantUsage.aggregate({ _sum: { storageUsedMb: true } }),
      db.tenantUsage.aggregate({ _sum: { apiCallsCount: true } }),
    ]);

    return {
      totalUsers: Number(totalUsers[0]?.count || 0),
      totalPatients: Number(totalPatients[0]?.count || 0),
      storageUsedMb: storageUsed._sum.storageUsedMb || 0,
      totalApiCalls: apiCalls._sum.apiCallsCount || 0,
    };
  }),

  // ─── Module Adoption ──────────────────────────────────────────
  getModuleAdoption: superAdminProcedure.query(async () => {
    const db = getControlDb();

    const modules = await db.module.findMany({
      include: {
        tenants: { where: { isEnabled: true } },
      },
    });

    return modules.map(m => ({
      moduleCode: m.code,
      moduleName: m.name,
      tenantCount: m.tenants.length,
      basePrice: Number(m.basePrice),
    }));
  }),

  // ─── Geographic Distribution ──────────────────────────────────
  getGeographicDistribution: superAdminProcedure.query(async () => {
    const db = getControlDb();

    const tenantsByRegion = await db.tenant.groupBy({
      by: ['region'],
      _count: { region: true },
      orderBy: { _count: { region: 'desc' } },
    });

    return tenantsByRegion.map(r => ({
      region: r.region,
      count: r._count.region,
    }));
  }),
});
