import { tenantProcedure, router } from '@/server/trpc/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const radiologyRouter: any = router({
  /**
   * getActiveOrders
   * Fetches pending and in-progress radiology orders.
   */
  getActiveOrders: tenantProcedure
    .query(async ({ ctx }: any) => {
      return ctx.db!.radiologyOrder.findMany({
        where: {
          status: { in: ['PENDING', 'SCHEDULED', 'IN_PROGRESS'] }
        },
        include: {
          patient: true,
          studies: true
        },
        orderBy: { orderedAt: 'desc' }
      });
    }),

  /**
   * getImagingStudy
   * Fetches the full DICOM structure of a specific study.
   */
  getImagingStudy: tenantProcedure
    .input(z.object({
      studyId: z.string()
    }))
    .query(async ({ ctx, input }: any) => {
      const study = await ctx.db!.imagingStudy.findUnique({
        where: { id: input.studyId },
        include: {
          patient: true,
          series: {
            include: {
              instances: true
            }
          },
          reports: true
        }
      });

      if (!study) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Imaging study not found'
        });
      }

      return study;
    }),

  /**
   * submitReport
   * Signs off a radiologist's findings for a study.
   */
  submitReport: tenantProcedure
    .input(z.object({
      studyId: z.string(),
      findings: z.string(),
      impression: z.string(),
      isCritical: z.boolean().default(false),
      radiologistId: z.string()
    }))
    .mutation(async ({ ctx, input }: any) => {
      return ctx.db!.$transaction(async (tx: any) => {
        // 1. Create Report
        const report = await tx.radiologyReport.create({
          data: {
            studyId: input.studyId,
            patientId: (await tx.imagingStudy.findUnique({ where: { id: input.studyId } }))?.patientId || '',
            findings: input.findings,
            impression: input.impression,
            isCriticalResult: input.isCritical,
            signingRadiologistId: input.radiologistId,
            status: 'SIGNED',
            signedAt: new Date()
          }
        });

        // 2. Update Study Status
        const study = await tx.imagingStudy.update({
          where: { id: input.studyId },
          data: { status: 'REPORTED' }
        });

        // 3. Update parent order status if all studies are reported
        if (study?.orderId) {
          await tx.radiologyOrder.update({
             where: { id: study.orderId },
             data: { status: 'COMPLETED' }
          });

          // 4. Timeline Event
          await tx.patientTimelineEvent.create({
            data: {
              patientId: study.patientId,
              eventType: 'RADIOLOGY_REPORT_SIGNED',
              title: 'Radiology report signed',
              description: `Report for ${study.studyDescription || 'study'} finalized. ${input.isCritical ? '⚠️ CRITICAL FINDINGS' : ''}`,
              actorId: ctx.session.userId,
              actorRole: ctx.session.role,
              encounterId: study.encounterId
            }
          });
        }

        return report;
      });
    }),

  /**
   * createOrder
   * Doctor initiates a radiology order.
   */
  createOrder: tenantProcedure
    .input(z.object({
      patientId: z.string(),
      encounterId: z.string(),
      modality: z.enum(['XRAY', 'CT', 'MRI', 'US', 'PET', 'NM']),
      targetRegion: z.string(),
      clinicalIndication: z.string(),
      priority: z.enum(['ROUTINE', 'URGENT', 'STAT']).default('ROUTINE'),
      billedAmount: z.number().optional()
    }))
    .mutation(async ({ ctx, input }: any) => {
      const order = await ctx.db!.radiologyOrder.create({
        data: {
          ...input,
          orderedById: ctx.session.userId!,
          status: 'PENDING'
        }
      });

      // Timeline Event
      await ctx.db!.patientTimelineEvent.create({
        data: {
          patientId: input.patientId,
          eventType: 'RADIOLOGY_ORDER_CREATED',
          title: 'Radiology order created',
          description: `${input.modality} of ${input.targetRegion} (${input.priority})`,
          actorId: ctx.session.userId,
          actorRole: ctx.session.role,
          encounterId: input.encounterId
        }
      });

      return order;
    })
});
