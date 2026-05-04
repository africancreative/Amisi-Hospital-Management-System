import { tenantProcedure, router, clinicalProcedure } from '@/server/trpc/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { calculateNEWS2, getRiskLevel } from '@amisimedos/sync/news2';
import { logAudit } from '@/lib/audit';

export const nursingRouter: any = router({
  /**
   * getAdmittedPatients
   * Fetches all patients currently in an 'ADMITTED' state for the nursing station.
   */
  getAdmittedPatients: tenantProcedure
    .query(async ({ ctx }: any) => {
      return ctx.db!.admission.findMany({
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
    .query(async ({ ctx }: any) => {
      // The context already contains resolved billing info from the middleware
      return ctx.billing;
    }),

  /**
   * recordVitals
   * Log a new set of vitals and calculate clinical stability (NEWS2).
   */
  recordVitals: clinicalProcedure
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
    .mutation(async ({ ctx, input }: any) => {
      // 1. Fetch patient to determine NEWS2 Scale (COPD toggle)
      const patient = await ctx.db!.patient.findUnique({
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
      const log = await ctx.db!.vitalsLog.create({
        data: {
          ...input,
          news2Score,
          isCritical: riskLevel !== 'LOW' || news2Score >= 5,
          recordedAt: new Date()
        }
      });

      // 5. Timeline Event
      await ctx.db!.patientTimelineEvent.create({
        data: {
          patientId: input.patientId,
          eventType: 'VITAL_RECORDED',
          title: `Vitals recorded (NEWS2: ${news2Score})`,
          description: `BP: ${input.bloodPressure || 'N/A'}, HR: ${input.heartRate || 'N/A'}, Temp: ${input.temperature || 'N/A'}. Status: ${riskLevel} RISK.`,
          actorId: ctx.session.userId,
          actorRole: ctx.session.role,
          encounterId: input.encounterId
        }
      });

      await logAudit({
        action: 'CREATE',
        resource: 'Vitals',
        resourceId: log.id,
        details: { patientId: input.patientId, news2Score },
        actor: { id: ctx.session.userId, name: ctx.session.userName, role: ctx.session.role }
      });

      return log;
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
    .query(async ({ ctx, input }: any) => {
      return ctx.db!.vitalsLog.findMany({
        where: { patientId: input.patientId },
        orderBy: { recordedAt: 'desc' },
        take: input.limit
      });
    }),

  /**
   * administerMedication
   * Record that a medication from a prescription was given.
   */
  administerMedication: clinicalProcedure
    .input(z.object({
      encounterId: z.string(),
      medicationName: z.string(),
      dosage: z.string(),
      route: z.string(),
      administeredBy: z.string(),
      status: z.string().default('GIVEN'),
      notes: z.string().optional()
    }))
    .mutation(async ({ ctx, input }: any) => {
      const admin = await ctx.db!.medicationAdministration.create({
        data: {
          ...input,
          administeredAt: new Date()
        }
      });

      // Timeline Event
      const encounter = await ctx.db!.encounter.findUnique({
        where: { id: input.encounterId },
        select: { patientId: true, visitId: true }
      });

      if (encounter) {
        await ctx.db!.patientTimelineEvent.create({
          data: {
            patientId: encounter.patientId,
            eventType: 'MEDICATION_GIVEN',
            title: `Medication Administered: ${input.medicationName}`,
            description: `${input.dosage} via ${input.route}. Status: ${input.status}.`,
            actorId: ctx.session.userId,
            actorRole: ctx.session.role,
            encounterId: input.encounterId,
            visitId: encounter.visitId
          }
        });
      }

      await logAudit({
        action: 'UPDATE',
        resource: 'MedicationAdministration',
        resourceId: admin.id,
        details: { medication: input.medicationName, patientId: encounter?.patientId },
        actor: { id: ctx.session.userId, name: ctx.session.userName, role: ctx.session.role }
      });

      return admin;
    })
});

