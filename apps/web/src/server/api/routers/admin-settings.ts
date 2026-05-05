import { z } from 'zod';
import { router, superAdminProcedure } from '@/server/trpc/trpc';
import { getControlDb } from '@amisimedos/db/client';

/**
 * System Settings & Configuration Router
 * Manages global platform behavior, feature flags, and regional configs
 */
export const adminSettingsRouter = router({
  // ─── Global Settings ───────────────────────────────────────
  getGlobalSettings: superAdminProcedure.query(async () => {
    const db = getControlDb();
    return db.globalSettings.findUnique({ where: { id: 'singleton' } });
  }),

  updateGlobalSettings: superAdminProcedure
    .input(z.object({
      platformName: z.string().optional(),
      platformSlogan: z.string().optional(),
      showHero: z.boolean().optional(),
      showFeatures: z.boolean().optional(),
      feature1Title: z.string().optional(),
      feature1Desc: z.string().optional(),
      feature2Title: z.string().optional(),
      feature2Desc: z.string().optional(),
      feature3Title: z.string().optional(),
      feature3Desc: z.string().optional(),
      paypalClientId: z.string().optional(),
      paypalClientSecret: z.string().optional(),
      paypalEnv: z.enum(['sandbox', 'live']).optional(),
      mpesaConsumerKey: z.string().optional(),
      mpesaConsumerSecret: z.string().optional(),
      mpesaPasskey: z.string().optional(),
      mpesaShortcode: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getControlDb();
      return db.globalSettings.upsert({
        where: { id: 'singleton' },
        update: input,
        create: { id: 'singleton', ...input },
      });
    }),

  // ─── System Admins Management ──────────────────────────────
  listSystemAdmins: superAdminProcedure.query(async () => {
    const db = getControlDb();
    return db.systemAdmin.findMany({ orderBy: { createdAt: 'desc' } });
  }),

  createSystemAdmin: superAdminProcedure
    .input(z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(8),
      role: z.enum(['SUPER_ADMIN', 'OPERATIONS_ADMIN', 'FINANCE_ADMIN', 'SUPPORT_ENGINEER']),
    }))
    .mutation(async ({ input }) => {
      const db = getControlDb();
      const { hashPassword } = await import('@amisimedos/db/lib/crypto');
      const passwordHash = await hashPassword(input.password);

      return db.systemAdmin.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash,
        },
      });
    }),

  deleteSystemAdmin: superAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const db = getControlDb();
      return db.systemAdmin.delete({ where: { id: input.id } });
    }),

  // ─── Security Settings ──────────────────────────────────────
  getSecuritySettings: superAdminProcedure.query(async () => {
    // Return security configuration
    return {
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      requireMFA: false,
      allowedIPs: [],
      auditRetentionDays: 365,
    };
  }),

  updateSecuritySettings: superAdminProcedure
    .input(z.object({
      sessionTimeout: z.number().min(300).max(86400).optional(),
      maxLoginAttempts: z.number().min(3).max(10).optional(),
      requireMFA: z.boolean().optional(),
      allowedIPs: z.array(z.string()).optional(),
      auditRetentionDays: z.number().min(30).max(2555).optional(),
    }))
    .mutation(async ({ input }) => {
      // Update security settings in GlobalSettings or separate config
      const db = getControlDb();
      return db.globalSettings.upsert({
        where: { id: 'singleton' },
        update: { ...input },
        create: { id: 'singleton', ...input },
      });
    }),

  // ─── Regional Configurations ────────────────────────────────
  getRegionalConfigs: superAdminProcedure.query(async () => {
    const db = getControlDb();
    // Return regional configurations
    return [
      { region: 'us-east-1', name: 'US East (N. Virginia)', enabled: true },
      { region: 'eu-west-1', name: 'EU West (Ireland)', enabled: true },
      { region: 'ap-south-1', name: 'Asia Pacific (Mumbai)', enabled: true },
      { region: 'sa-east-1', name: 'South America (São Paulo)', enabled: false },
    ];
  }),

  updateRegionalConfig: superAdminProcedure
    .input(z.object({
      region: z.string(),
      enabled: z.boolean(),
      settings: z.record(z.any()).optional(),
    }))
    .mutation(async ({ input }) => {
      // Update regional configuration
      console.log('Updating regional config:', input);
      return { success: true };
    }),

  // ─── Default Tenant Settings ───────────────────────────────
  getDefaultTenantSettings: superAdminProcedure.query(async () => {
    return {
      defaultTier: 'CLINIC',
      defaultModules: ['MOD-PM', 'MOD-TQ', 'MOD-EC', 'MOD-BR'],
      defaultQuotas: {
        seat_limit: 5,
        storage_mb: 5000,
        patient_limit: 100,
        bed_limit: 10,
      },
      trialDays: 14,
    };
  }),

  updateDefaultTenantSettings: superAdminProcedure
    .input(z.object({
      defaultTier: z.enum(['CLINIC', 'HOSPITAL', 'LAB', 'PHARMACY', 'SPECIALIST']).optional(),
      defaultModules: z.array(z.string()).optional(),
      defaultQuotas: z.record(z.number()).optional(),
      trialDays: z.number().min(0).max(90).optional(),
    }))
    .mutation(async ({ input }) => {
      console.log('Updating default tenant settings:', input);
      return { success: true };
    }),
});
