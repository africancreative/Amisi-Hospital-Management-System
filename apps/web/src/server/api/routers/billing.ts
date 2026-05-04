import { z } from 'zod';
import { tenantProcedure, protectedProcedure, router } from '@/server/trpc/trpc';
import { BillingService } from '@/server/services/billing_service';

/**
 * Billing Router
 * Implementation of Granular Billing, Partial Payments, and Auto-Invoicing
 */
export const billingRouter: any = router({
  getInvoice: tenantProcedure
    .input(z.string())
    .query(async ({ ctx, input }: any) => {
      if (!ctx.db) throw new Error('Database not initialized');
      return ctx.db!.invoice.findUnique({
        where: { id: input },
        include: { billItems: { include: { allocations: { include: { payment: true } } } }, payments: true }
      });
    }),
  getOpenInvoices: tenantProcedure
    .query(async ({ ctx }: any) => {
      if (!ctx.db) throw new Error('Database not initialized');
      return ctx.db!.invoice.findMany({
        where: { status: { in: ['OPEN', 'PARTIAL'] } },
        orderBy: { createdAt: 'desc' },
        include: { patient: true, visit: true }
      });
    }),

  getVisitBill: tenantProcedure
    .input(z.string())
    .query(async ({ ctx, input }: any) => {
      if (!ctx.db) throw new Error('Database not initialized');
      return ctx.db!.visit.findUnique({
        where: { id: input },
        include: { invoices: { include: { billItems: true, payments: true } } }
      });
    }),

  createBillItem: protectedProcedure
    .input(z.object({
      visitId: z.string(),
      patientId: z.string(),
      description: z.string(),
      quantity: z.number(),
      unitPrice: z.number(),
      category: z.string(),
      taxRate: z.number().default(0),
      discountAmount: z.number().default(0),
      discountReason: z.string().optional(),
      isExempt: z.boolean().default(false),
      exemptionReason: z.string().optional(),
      currency: z.string().default('USD')
    }))
    .mutation(async ({ ctx, input }: any) => {
      if (!ctx.db) throw new Error('Database not initialized');
      const { visitId, patientId, taxRate, discountAmount, isExempt, ...rest } = input;
      const billing = new BillingService(ctx.db);
      
      const invoice = await billing.resolveActiveInvoice(visitId, patientId);
      
      // Calculate dynamic prices
      const pricing = billing.calculateDynamicPrice(input.unitPrice, input.quantity, taxRate, discountAmount, isExempt);
      
      const item = await ctx.db!.billItem.create({
        data: { 
          ...rest,
          taxRate,
          discountAmount,
          isExempt,
          taxAmount: pricing.taxAmount,
          totalPrice: pricing.totalPrice,
          visitId, 
          invoiceId: invoice.id, 
          status: 'UNPAID', 
          version: 1, 
          isSynced: false 
        }
      });
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
    .mutation(async ({ ctx, input }: any) => {
      if (!ctx.db) throw new Error('Database not initialized');
      const { invoiceId, ...data } = input;
      return ctx.db!.invoice.update({ where: { id: invoiceId }, data: { ...data, version: { increment: 1 }, isSynced: false } });
    }),

  recordPayment: protectedProcedure
    .input(z.object({
      invoiceId: z.string(),
      amount: z.number(),
      method: z.string(),
      currency: z.string().default('USD'),
      reference: z.string().optional(),
      autoAllocate: z.boolean().default(true),
      allocations: z.array(z.object({ billItemId: z.string(), amount: z.number() })).optional()
    }))
    .mutation(async ({ ctx, input }: any) => {
      if (!ctx.db) throw new Error('Database not initialized');
      const { allocations, invoiceId, autoAllocate, ...paymentData } = input;
      const billing = new BillingService(ctx.db);
      const payment = await ctx.db!.payment.create({ data: { ...paymentData, invoiceId, version: 1, isSynced: false } });
      if (allocations && allocations.length > 0) {
        await ctx.db!.$transaction(allocations.map((alloc: any) => ctx.db!.paymentAllocation.create({ data: { paymentId: payment.id, billItemId: alloc.billItemId, amount: alloc.amount } })));
        await billing.calculateInvoiceTotals(invoiceId);
      } else if (autoAllocate) {
        await billing.autoAllocatePayment(payment.id, invoiceId);
      } else {
        await billing.calculateInvoiceTotals(invoiceId);
      }
      return payment;
    }),

  /**
   * getPrintableDocument
   * Generates HTML for receipts (Thermal) or invoices (A4).
   */
  getPrintableDocument: tenantProcedure
    .input(z.object({
      invoiceId: z.string(),
      format: z.enum(['THERMAL', 'A4']),
      type: z.enum(['RECEIPT', 'INVOICE'])
    }))
    .query(async ({ ctx, input }: any) => {
      const { PrintService } = await import('@amisimedos/billing');
      const printer = new PrintService(ctx.db!);
      
      if (input.type === 'RECEIPT') {
        return printer.printReceipt(input.invoiceId, input.format);
      } else {
        return printer.printInvoice(input.invoiceId, input.format);
      }
    }),
});