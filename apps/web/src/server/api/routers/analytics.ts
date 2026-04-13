import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { db as controlDb } from '@amisimedos/db/control';
import { getTenantDb } from '@/lib/db';

/**
 * Cloud Analytics Router
 * 
 * Aggregates statistics across multiple hospital tenants for executive oversight.
 */
export const analyticsRouter = createTRPCRouter({
  
  /**
   * Cross-Tenant Global Overview
   * Iterates through all active tenants and sums up critical KPIs.
   */
  getGlobalKpis: publicProcedure // In production, this would be protectedProcedure with ADMIN role
    .meta({ cloudOnly: true })
    .query(async () => {
      // 1. Fetch all active tenants from the Control Database
      const tenants = await controlDb.tenant.findMany({
        where: { status: 'ACTIVE' }
      });

      let totalAdmissions = 0;
      let totalRevenue = 0;
      let totalPatients = 0;
      const hospitalBreakdown: any[] = [];

      // 2. Aggregate data from each tenant's private clinical database
      for (const tenant of tenants) {
        try {
          const tenantDb = await getTenantDb(tenant.id);
          
          const patientCount = await tenantDb.patient.count();
          const activeAdmissions = await tenantDb.admission.count({ where: { status: 'ADMITTED' } });
          
          // Simple revenue sum for the current month
          const revenue = await tenantDb.billItem.aggregate({
            _sum: { price: true },
            where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }
          });

          const revenueValue = Number(revenue._sum.price || 0);

          totalPatients += patientCount;
          totalAdmissions += activeAdmissions;
          totalRevenue += revenueValue;

          hospitalBreakdown.push({
             name: tenant.name,
             patients: patientCount,
             admissions: activeAdmissions,
             revenue: revenueValue,
             status: 'ONLINE'
          });
        } catch (err) {
          console.error(`[Analytics] Failed to fetch data for tenant ${tenant.id}:`, err);
          hospitalBreakdown.push({ name: tenant.name, status: 'OFFLINE', error: true });
        }
      }

      return {
        aggregate: {
          totalPatients,
          totalAdmissions,
          monthToDateRevenue: totalRevenue,
          activeUnits: tenants.length
        },
        hospitalBreakdown
      };
    }),

  /**
   * Daily Volume Trends
   * Aggregates patient intake across the last 30 days.
   */
  getDailyTrends: publicProcedure
    .query(async () => {
       // Implementation would involve a more complex time-series aggregation
       // For this MVP, we return mockup data representing the last 7 days
       return [
          { day: 'Mon', count: 142 },
          { day: 'Tue', count: 218 },
          { day: 'Wed', count: 184 },
          { day: 'Thu', count: 256 },
          { day: 'Fri', count: 312 },
          { day: 'Sat', count: 198 },
          { day: 'Sun', count: 112 },
       ];
    })
});
