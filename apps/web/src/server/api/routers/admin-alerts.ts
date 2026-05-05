import { z } from 'zod';
import { router, superAdminProcedure } from '@/server/trpc/trpc';

/**
 * System Alerts Router
 * Critical alert detection and response
 */
export const adminAlertsRouter = router({
  // ─── Get Active Alerts ─────────────────────────────
  getActiveAlerts: superAdminProcedure
    .input(z.object({
      severity: z.enum(['critical', 'warning', 'info']).optional(),
      category: z.enum(['system', 'billing', 'sync', 'security']).optional(),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ input }) => {
      // Mock alerts - replace with actual alert service
      const alerts = [
        {
          id: '1',
          severity: 'critical' as const,
          category: 'sync' as const,
          message: 'Sync node ap-south-1 latency > 400ms for 15 minutes',
          createdAt: new Date(Date.now() - 600000),
          acknowledged: false,
        },
        {
          id: '2',
          severity: 'warning' as const,
          category: 'system' as const,
          message: 'Database connection pool 80% utilized',
          createdAt: new Date(Date.now() - 1800000),
          acknowledged: false,
        },
        {
          id: '3',
          severity: 'warning' as const,
          category: 'billing' as const,
          message: '3 tenants approaching storage quota (90%+)',
          createdAt: new Date(Date.now() - 3600000),
          acknowledged: false,
        },
        {
          id: '4',
          severity: 'critical' as const,
          category: 'billing' as const,
          message: 'Tenant "Metro Lab" payment failed - 3 attempts',
          tenantId: 'tenant-3',
          tenantName: 'Metro Lab Services',
          createdAt: new Date(Date.now() - 7200000),
          acknowledged: false,
        },
        {
          id: '5',
          severity: 'info' as const,
          category: 'system' as const,
          message: 'System backup completed successfully',
          createdAt: new Date(Date.now() - 7200000),
          acknowledged: true,
          acknowledgedBy: 'ops_admin',
          acknowledgedAt: new Date(Date.now() - 6000000),
        },
      ];

      let filtered = alerts;
      if (input?.severity) {
        filtered = filtered.filter(a => a.severity === input.severity);
      }
      if (input?.category) {
        filtered = filtered.filter(a => a.category === input.category);
      }

      return filtered.slice(0, input?.limit || 50);
    }),

  // ─── Get Alert Statistics ─────────────────────────────
  getAlertStats: superAdminProcedure.query(async () => {
    // Mock stats - replace with actual aggregation
    return {
      critical: 2,
      warning: 3,
      info: 1,
      acknowledged: 1,
      unacknowledged: 4,
      byCategory: {
        system: 2,
        billing: 2,
        sync: 1,
        security: 0,
      },
    };
  }),

  // ─── Acknowledge Alert ─────────────────────────────
  acknowledgeAlert: superAdminProcedure
    .input(z.object({
      alertId: z.string(),
      note: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // In production, update alert in database
      console.log(`Alert ${input.alertId} acknowledged`, input.note);
      return { success: true, acknowledgedAt: new Date() };
    }),

  // ─── Resolve Alert ───────────────────────────────
  resolveAlert: superAdminProcedure
    .input(z.object({
      alertId: z.string(),
      resolution: z.string().min(10),
    }))
    .mutation(async ({ input }) => {
      // In production, update alert status
      console.log(`Alert ${input.alertId} resolved`, input.resolution);
      return { success: true, resolvedAt: new Date() };
    }),

  // ─── Create Alert (System Generated) ──────────────────
  createAlert: superAdminProcedure
    .input(z.object({
      severity: z.enum(['critical', 'warning', 'info']),
      category: z.enum(['system', 'billing', 'sync', 'security']),
      message: z.string().min(10),
      tenantId: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // In production, save to alerts table
      const alert = {
        id: `alert_${Date.now()}`,
        ...input,
        createdAt: new Date(),
        acknowledged: false,
      };
      console.log('Alert created:', alert);
      return alert;
    }),

  // ─── Get Alert Rules ───────────────────────────────
  getAlertRules: superAdminProcedure.query(async () => {
    return [
      {
        id: '1',
        name: 'High Sync Latency',
        condition: 'sync_latency > 300ms for 5 minutes',
        severity: 'warning' as const,
        enabled: true,
        notifyRoles: ['OPERATIONS_ADMIN', 'SUPER_ADMIN'],
      },
      {
        id: '2',
        name: 'Payment Failure',
        condition: 'payment_failed >= 3 attempts',
        severity: 'critical' as const,
        enabled: true,
        notifyRoles: ['FINANCE_ADMIN', 'SUPER_ADMIN'],
      },
      {
        id: '3',
        name: 'Storage Quota',
        condition: 'storage_used > 90%',
        severity: 'warning' as const,
        enabled: true,
        notifyRoles: ['OPERATIONS_ADMIN', 'FINANCE_ADMIN'],
      },
      {
        id: '4',
        name: 'Database Connection',
        condition: 'db_connections > 80%',
        severity: 'critical' as const,
        enabled: true,
        notifyRoles: ['OPERATIONS_ADMIN', 'SUPER_ADMIN'],
      },
    ];
  }),

  // ─── Update Alert Rule ──────────────────────────────
  updateAlertRule: superAdminProcedure
    .input(z.object({
      ruleId: z.string(),
      enabled: z.boolean().optional(),
      notifyRoles: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const { ruleId, ...updateData } = input;
      console.log(`Updating alert rule ${ruleId}:`, updateData);
      return { success: true };
    }),
});
