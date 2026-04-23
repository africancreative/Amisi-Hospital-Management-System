import { tenantProcedure, router, clinicalProcedure, labProcedure } from '@/server/trpc/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { logAudit } from '@/lib/audit';

export const labRouter = router({
  /**
   * getActiveOrders
   * Fetches all pending and in-progress lab orders for the facility.
   */
  getActiveOrders: tenantProcedure
    .query(async ({ ctx }) => {
      return ctx.db!.labOrder.findMany({
        where: {
          status: { in: ['PENDING', 'SAMPLE_COLLECTED', 'IN_ANALYSIS'] }
        },
        include: {
          patient: true,
          samples: true,
          results: true
        },
        orderBy: { orderedAt: 'desc' }
      });
    }),

  /**
   * collectSample
   * Marks a lab order sample as collected and triggers billing.
   */
  collectSample: clinicalProcedure
    .input(z.object({
      orderId: z.string(),
      specimenType: z.string(),
      barcode: z.string(),
      collectedById: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db!.$transaction(async (tx) => {
        // 1. Create Sample Record
        const sample = await tx.labSample.create({
          data: {
            labOrderId: input.orderId,
            specimenType: input.specimenType,
            barcode: input.barcode,
            collectedAt: new Date(),
            collectedById: input.collectedById
          }
        });

        // 2. Update Order Status
        const order = await tx.labOrder.update({
          where: { id: input.orderId },
          data: { status: 'SAMPLE_COLLECTED' },
          include: { encounter: true }
        });

        // 3. AUTOMATED BILLING TRIGGER
        // If the order has an encounter, we create a BillItem automatically
        if (order.encounterId) {
          // Find or Create Invoice for this encounter
          let invoice = await tx.invoice.findUnique({
            where: { encounterId: order.encounterId }
          });

          if (!invoice && order.patientId) {
            invoice = await tx.invoice.create({
              data: {
                patientId: order.patientId,
                encounterId: order.encounterId,
                status: 'OPEN',
                totalAmount: 0,
                balanceDue: 0
              }
            });
          }

          if (invoice && order.encounter?.visitId) {
             const unitPrice = order.billedAmount || 1500; // Fallback or lookup
             await tx.billItem.create({
                data: {
                  invoiceId: invoice.id,
                  visitId: order.encounter.visitId,
                  description: `Laboratory: ${order.testPanelId}`,
                  quantity: 1,
                  unitPrice,
                  totalPrice: unitPrice,
                  category: 'LAB',
                  status: 'UNPAID'
                }
             });

             // Update Invoice Totals
             await tx.invoice.update({
                where: { id: invoice.id },
                data: {
                   totalAmount: { increment: unitPrice },
                   balanceDue: { increment: unitPrice }
                }
             });
          }
        }

        return { sample, order };
      });

      await logAudit({
        action: 'UPDATE',
        resource: 'LabOrder',
        resourceId: input.orderId,
        details: { action: 'COLLECT_SAMPLE', specimen: input.specimenType },
        actor: { id: ctx.session.userId, name: ctx.session.userName, role: ctx.session.role }
      });

      return result;
    }),

  /**
   * recordResults
   * Input multiple biomarker results for a single lab order.
   */
  recordResults: labProcedure
    .input(z.object({
      orderId: z.string(),
      results: z.array(z.object({
        biomarkerName: z.string(),
        valueResult: z.string(),
        numericValue: z.number().optional(),
        unit: z.string().optional(),
        flag: z.string().default('NORMAL')
      }))
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db!.$transaction(async (tx) => {
        // 1. Create Result Entries
        await tx.labResult.createMany({
          data: input.results.map(r => ({
            labOrderId: input.orderId,
            ...r
          }))
        });

        const order = await tx.labOrder.findUnique({ where: { id: input.orderId } });

        // 2. Advance Status to Analysis
        const updatedOrder = await tx.labOrder.update({
          where: { id: input.orderId },
          data: { status: 'IN_ANALYSIS' }
        });

        // 3. Timeline Event
        if (order?.patientId) {
          await tx.patientTimelineEvent.create({
            data: {
              patientId: order.patientId,
              eventType: 'LAB_RESULT_UPLOADED',
              title: 'Lab results uploaded',
              description: `Results for ${order.testPanelId} are now in analysis.`,
              actorId: ctx.session.userId,
              actorRole: ctx.session.role,
            }
          });
        }

        return updatedOrder;
      });

      await logAudit({
        action: 'UPDATE',
        resource: 'LabOrder',
        resourceId: input.orderId,
        details: { action: 'RECORD_RESULTS', count: input.results.length },
        actor: { id: ctx.session.userId, name: ctx.session.userName, role: ctx.session.role }
      });

      return result;
    }),

  /**
   * createOrder
   * Doctor initiates a lab order.
   */
  createOrder: clinicalProcedure
    .input(z.object({
      patientId: z.string(),
      encounterId: z.string().optional(),
      testPanelId: z.string(),
      urgency: z.enum(['ROUTINE', 'STAT', 'ASAP']).default('ROUTINE'),
      clinicalNotes: z.string().optional(),
      billedAmount: z.number().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db!.labOrder.create({
        data: {
          ...input,
          orderedById: ctx.session.userId,
          status: 'PENDING'
        }
      });

      // Timeline Event
      await ctx.db!.patientTimelineEvent.create({
        data: {
          patientId: input.patientId,
          eventType: 'LAB_ORDER_CREATED',
          title: 'Lab order created',
          description: `Order for ${input.testPanelId} (${input.urgency})`,
          actorId: ctx.session.userId,
          actorRole: ctx.session.role,
          encounterId: input.encounterId
        }
      });

      return order;
    }),

  /**
   * finalizeReport
   * Pathologist validates results and signs off.
   */
  finalizeReport: labProcedure
    .input(z.object({
      orderId: z.string(),
      pathologistId: z.string(),
      clinicalInterpretation: z.string().optional(),
      isCritical: z.boolean().default(false),
      pdfUrl: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db!.$transaction(async (tx) => {
        const report = await tx.labReport.create({
          data: {
            labOrderId: input.orderId,
            pathologistId: input.pathologistId,
            clinicalInterpretation: input.clinicalInterpretation,
            isCritical: input.isCritical,
            pdfUrl: input.pdfUrl,
            status: 'FINAL',
            validatedAt: new Date()
          }
        });

        const order = await tx.labOrder.update({
          where: { id: input.orderId },
          data: { status: 'COMPLETED' }
        });

        // Timeline Event
        if (order.patientId) {
          await tx.patientTimelineEvent.create({
            data: {
              patientId: order.patientId,
              eventType: 'LAB_REPORT_FINALIZED',
              title: 'Lab report finalized',
              description: `Report for ${order.testPanelId} is now available. ${input.isCritical ? '⚠️ CRITICAL FINDINGS' : ''}`,
              actorId: ctx.session.userId,
              actorRole: ctx.session.role,
            }
          });
        }

        return report;
      });

      await logAudit({
        action: 'UPDATE',
        resource: 'LabOrder',
        resourceId: input.orderId,
        details: { action: 'FINALIZE_REPORT', isCritical: input.isCritical },
        actor: { id: ctx.session.userId, name: ctx.session.userName, role: ctx.session.role }
      });

      return result;
    })
});
