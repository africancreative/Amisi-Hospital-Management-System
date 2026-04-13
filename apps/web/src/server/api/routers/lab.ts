import { tenantProcedure, router } from '@/server/trpc/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const labRouter = router({
  /**
   * getActiveOrders
   * Fetches all pending and in-progress lab orders for the facility.
   */
  getActiveOrders: tenantProcedure
    .query(async ({ ctx }) => {
      return ctx.db.labOrder.findMany({
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
  collectSample: tenantProcedure
    .input(z.object({
      orderId: z.string(),
      specimenType: z.string(),
      barcode: z.string(),
      collectedById: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
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
    }),

  /**
   * recordResults
   * Input multiple biomarker results for a single lab order.
   */
  recordResults: tenantProcedure
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
      return ctx.db.$transaction(async (tx) => {
        // 1. Create Result Entries
        await tx.labResult.createMany({
          data: input.results.map(r => ({
            labOrderId: input.orderId,
            ...r
          }))
        });

        // 2. Advance Status to Analysis/Competed (pending validation)
        return tx.labOrder.update({
          where: { id: input.orderId },
          data: { status: 'IN_ANALYSIS' }
        });
      });
    })
});
