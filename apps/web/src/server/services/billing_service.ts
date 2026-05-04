import { type TenantClient } from '@amisimedos/db/client';

/**
 * Billing Service
 * 
 * Encapsulates complex clinical billing logic:
 * - Automatic Invoice resolution
 * - Balance calculation across granular BillItems
 * - FIFO Allocation logic
 */
export class BillingService {
  constructor(private db: TenantClient) {}

  /**
   * Calculates the final price of an item given its base price, tax rate, and discounts.
   * Logic: (Base Price - Discount) + Tax = Final Price
   */
  calculateDynamicPrice(unitPrice: number, quantity: number, taxRate: number, discountAmount: number, isExempt: boolean) {
    const subtotal = (unitPrice * quantity) - discountAmount;
    const finalSubtotal = subtotal > 0 ? subtotal : 0; // Prevent negative prices
    const taxAmount = isExempt ? 0 : finalSubtotal * (taxRate / 100);
    return {
      subtotal: finalSubtotal,
      taxAmount,
      totalPrice: finalSubtotal + taxAmount,
    };
  }

  /**
   * Resolves or creates an active invoice for a Visit.
   * Ensures that every service request is immediately billed.
   */
  async resolveActiveInvoice(visitId: string, patientId: string) {
    // 1. Check for an OPEN invoice for this visit
    let invoice = await this.db.invoice.findFirst({
      where: {
        visitId,
        status: 'OPEN',
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. If no open invoice, create one automatically
    if (!invoice) {
      console.log(`[Billing Service] Auto-generating invoice for Visit: ${visitId}`);
      invoice = await this.db.invoice.create({
        data: {
          visitId,
          patientId,
          status: 'OPEN',
          payerType: 'CASH', // Default to cash unless insurance is added later
          version: 1,
          isSynced: false,
        },
      });
    }

    return invoice;
  }

  /**
   * Calculates the remaining balance for an Invoice by summing all BillItems and 
   * subtracting all Payments.
   */
  async calculateInvoiceTotals(invoiceId: string) {
    const invoice = await this.db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        billItems: true,
        payments: true,
      },
    });

    if (!invoice) throw new Error('Invoice not found');

    const totalBilled = invoice.billItems.reduce((acc: any, item: any) => acc + Number(item.totalPrice), 0);
    const totalPaid = invoice.payments.reduce((acc: any, p: any) => acc + Number(p.amount), 0);
    const balanceDue = totalBilled - totalPaid;

    // Update the invoice summary fields (caching the results)
    return this.db.invoice.update({
      where: { id: invoiceId },
      data: {
        totalAmount: totalBilled,
        balanceDue: balanceDue,
        status: balanceDue <= 0 ? 'PAID' : (totalPaid > 0 ? 'PARTIAL' : 'OPEN'),
      },
    });
  }

  /**
   * FIFO Auto-Allocation
   * Automatically allocates a general payment to the oldest unpaid BillItems.
   */
  async autoAllocatePayment(paymentId: string, invoiceId: string) {
    const payment = await this.db.payment.findUnique({
      where: { id: paymentId },
    });
    if (!payment) throw new Error('Payment not found');

    const unpaidItems = await this.db.billItem.findMany({
      where: {
        invoiceId,
        status: { in: ['UNPAID', 'PARTIAL'] },
      },
      orderBy: { createdAt: 'asc' }, // FIFO
    });

    let remainingPayment = Number(payment.amount);

    for (const item of unpaidItems) {
      if (remainingPayment <= 0) break;

      // Calculate item balance
      const allocations = await this.db.paymentAllocation.findMany({
        where: { billItemId: item.id }
      });
      const allocatedAmount = allocations.reduce((sum: any, a: any) => sum + Number(a.amount), 0);
      const itemBalance = Number(item.totalPrice) - allocatedAmount;

      const amountToAllocate = Math.min(remainingPayment, itemBalance);

      if (amountToAllocate > 0) {
        await this.db.paymentAllocation.create({
          data: {
            paymentId,
            billItemId: item.id,
            amount: amountToAllocate,
          },
        });

        remainingPayment -= amountToAllocate;

        // Update item status
        const isFullyPaid = (allocatedAmount + amountToAllocate) >= Number(item.totalPrice);
        await this.db.billItem.update({
          where: { id: item.id },
          data: { status: isFullyPaid ? 'PAID' : 'PARTIAL' }
        });
      }
    }

    return this.calculateInvoiceTotals(invoiceId);
  }
}
