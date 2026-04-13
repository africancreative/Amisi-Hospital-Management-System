import { z } from 'zod';
import { tenantProcedure, protectedProcedure, router } from '@/server/trpc/trpc';
import { BillingService } from '@/server/services/billing_service';

/**
 * Billing Router
 * Implementation of Granular Billing, Partial Payments, and Auto-Invoicing
 */
export const billingRouter = router({
  getInvoice: tenantProcedure
    .input(z.string()) // invoiceId
    .query(async ({ ctx, input }) => {
      return ctx.db.invoice.findUnique({
        where: { id: input },
        include: {
          billItems: {
            include: {
              allocations: {
                include: { payment: true }
              }
            }
          },
          payments: true
        }
      });
    }),

  getVisitBill: tenantProcedure
    .input(z.string()) // visitId
    .query(async ({ ctx, input }) => {
      return ctx.db.visit.findUnique({
        where: { id: input },
        include: {
          invoices: {
            include: {
              billItems: true,
              payments: true
            }
          }
        }
      });
    }),

  /**
   * Every Service = BillItem
   * Triggered by Modules (Lab, Pharmacy, Nursing)
   */
  createBillItem: protectedProcedure
    .input(z.object({
      visitId: z.string(),
      patientId: z.string(),
      description: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      category: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { visitId, patientId, ...rest } = input;
      const billing = new BillingService(ctx.db);
      
      // 1. Resolve/Auto-create Invoice
      const invoice = await billing.resolveActiveInvoice(visitId, patientId);
      
      const totalPrice = input.quantity * input.unitPrice;
      
      // 2. Create BillItem linked to Invoice
      const item = await ctx.db.billItem.create({
        data: {
          ...rest,
          totalPrice,
          visitId,
          invoiceId: invoice.id,
          status: 'UNPAID',
          version: 1,
          isSynced: false,
        }
      });

      // 3. Update Invoice Totals
      await billing.calculateInvoiceTotals(invoice.id);

      return item;
    }),

  updateInsuranceInfo: protectedProcedure
    .input(z.object({
      invoiceId: z.string(),
      payerType: z.enum(['CASH', 'INSURANCE', 'CORPORATE']),
      insurancePolicyNumber: z.string().optional(),
      preAuthCode: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { invoiceId, ...data } = input;
      return ctx.db.invoice.update({
        where: { id: invoiceId },
        data: {
          ...data,
          version: { increment: 1 },
          isSynced: false,
        }
      });
    }),

  recordPayment: protectedProcedure
    .input(z.object({
      invoiceId: z.string(),
      amount: z.number(),
      method: z.string(),
      reference: z.string().optional(),
      autoAllocate: z.boolean().default(true),
      allocations: z.array(z.object({
        billItemId: z.string(),
        amount: z.number()
      })).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { allocations, invoiceId, autoAllocate, ...paymentData } = input;
      const billing = new BillingService(ctx.db);
      
      // 1. Create the Payment
      const payment = await ctx.db.payment.create({
        data: {
          ...paymentData,
          invoiceId,
          version: 1,
          isSynced: false,
        }
      });

      // 2. Allocation Logic
      if (allocations && allocations.length > 0) {
        // Precise manual allocation
        await ctx.db.$transaction(
          allocations.map(alloc => 
            ctx.db.paymentAllocation.create({
              data: {
                paymentId: payment.id,
                billItemId: alloc.billItemId,
                amount: alloc.amount
              }
            })
          )
        );
        await billing.calculateInvoiceTotals(invoiceId);
      } else if (autoAllocate) {
        // Smart FIFO allocation
        await billing.autoAllocatePayment(payment.id, invoiceId);
      } else {
        // Unallocated payment (Credit)
        await billing.calculateInvoiceTotals(invoiceId);
      }

      return payment;
    }),
});
