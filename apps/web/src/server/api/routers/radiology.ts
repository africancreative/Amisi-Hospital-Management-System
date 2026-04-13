import { tenantProcedure, router } from '@/server/trpc/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const radiologyRouter = router({
  /**
   * getActiveOrders
   * Fetches pending and in-progress radiology orders.
   */
  getActiveOrders: tenantProcedure
    .query(async ({ ctx }) => {
      return ctx.db.radiologyOrder.findMany({
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
    .query(async ({ ctx, input }) => {
      const study = await ctx.db.imagingStudy.findUnique({
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
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
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
        await tx.imagingStudy.update({
          where: { id: input.studyId },
          data: { status: 'REPORTED' }
        });

        // 3. Update parent order status if all studies are reported
        const study = await tx.imagingStudy.findUnique({
          where: { id: input.studyId },
          select: { orderId: true }
        });

        if (study?.orderId) {
          await tx.radiologyOrder.update({
             where: { id: study.orderId },
             data: { status: 'COMPLETED' }
          });
        }

        return report;
      });
    })
});
