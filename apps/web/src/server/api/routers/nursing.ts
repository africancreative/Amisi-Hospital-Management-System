import { tenantProcedure, router } from '@/server/trpc/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { calculateNEWS2, getRiskLevel } from '@amisimedos/sync/news2';

export const nursingRouter = router({
  /**
   * getAdmittedPatients
   * Fetches all patients currently in an 'ADMITTED' state for the nursing station.
   */
  getAdmittedPatients: tenantProcedure
    .query(async ({ ctx }) => {
      return ctx.db.admission.findMany({
        where: { status: 'ADMITTED' },
        include: {
          encounter: {
            include: {
              patient: true,
              prescriptions: {
                include: { items: true }
              }
            }
          },
          bed: { include: { ward: true } }
        },
        orderBy: { admittedAt: 'desc' }
      });
    }),

  /**
   * Resilience Check: Get Local Subscription Status
   */
  getBillingStatus: tenantProcedure
    .query(async ({ ctx }) => {
      // The context already contains resolved billing info from the middleware
      return ctx.billing;
    }),

  /**
   * recordVitals
   * Log a new set of vitals and calculate clinical stability (NEWS2).
   */
  recordVitals: tenantProcedure
    .input(z.object({
      patientId: z.string(),
      encounterId: z.string().optional(),
      bloodPressure: z.string().optional(),
      heartRate: z.number().optional(),
      temperature: z.number().optional(),
      spO2: z.number().optional(),
      respiratoryRate: z.number().optional(),
      isSupplementalOxygen: z.boolean().default(false),
      consciousness: z.enum(['A', 'C', 'V', 'P', 'U']).default('A'),
      painScore: z.number().optional(),
      recordedBy: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      // 1. Fetch patient to determine NEWS2 Scale (COPD toggle)
      const patient = await ctx.db.patient.findUnique({
        where: { id: input.patientId },
        select: { respiratoryScale: true }
      });

      // 2. Parse Systolic BP from string (e.g. '120/80')
      const systolicBP = input.bloodPressure ? parseInt(input.bloodPressure.split('/')[0]) : undefined;

      // 3. Calculate NEWS2 Score
      const news2Score = calculateNEWS2({
        ...input,
        systolicBP
      }, (patient?.respiratoryScale as any) || 1);

      const riskLevel = getRiskLevel(news2Score);

      // 4. Save Vitals Log
      return ctx.db.vitalsLog.create({
        data: {
          ...input,
          news2Score,
          riskLevel,
          isCritical: riskLevel !== 'LOW' || news2Score >= 5,
          recordedAt: new Date()
        }
      });
    }),

  /**
   * getVitalsHistory
   * Fetch historical vitals for trending charts.
   */
  getVitalsHistory: tenantProcedure
    .input(z.object({
      patientId: z.string(),
      limit: z.number().default(20)
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.vitalsLog.findMany({
        where: { patientId: input.patientId },
        orderBy: { recordedAt: 'desc' },
        take: input.limit
      });
    }),

  /**
   * administerMedication
   * Record that a medication from a prescription was given.
   */
  administerMedication: tenantProcedure
    .input(z.object({
      encounterId: z.string(),
      medicationName: z.string(),
      dosage: z.string(),
      route: z.string(),
      administeredBy: z.string(),
      status: z.string().default('GIVEN'),
      notes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.medicationAdministration.create({
        data: {
          ...input,
          administeredAt: new Date()
        }
      });
    })
});

