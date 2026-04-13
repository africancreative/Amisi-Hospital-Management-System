import { TenantClient as PrismaClient } from '@amisimedos/db';
import { InventoryService } from './inventory-service';

/**
 * Global Billing Synchronization Service
 * 
 * Ensures that clinical actions are financially tracked in real-time.
 * Every triage, consult, and procedure calls this service to prevent revenue leakage.
 */

export class BillingService {
  constructor(private db: any) {}

  /**
   * Appends a new billing line to a patient visit.
   * If an active invoice exists, it attaches the item to it.
   * If inventoryItemId is provided, it also deducts stock.
   */
  async recordServiceCharge(params: {
    visitId: string;
    description: string;
    unitPrice: number;
    quantity?: number;
    category: 'CONSULTATION' | 'LAB' | 'PHARMACY' | 'PROCEDURE' | 'EQUIPMENT' | 'STAY';
    inventoryItemId?: string;
    authorId?: string;
  }) {
    const { visitId, description, unitPrice, quantity = 1, category, inventoryItemId, authorId } = params;
    const totalPrice = unitPrice * quantity;

    // 1. Inventory Automation (FEFO)
    // We do this first to ensure stock availability before billing
    if (inventoryItemId) {
        const inventory = new InventoryService(this.db);
        await inventory.decrementStockWithFEFO({
            itemId: inventoryItemId,
            quantity: quantity,
            reason: `Billed to Visit ${visitId}: ${description}`,
            visitId: visitId,
            dispensedBy: authorId || 'SYSTEM'
        });
    }

    // 2. Find or create the current open invoice for this visit
    let invoice = await this.db.invoice.findFirst({
        where: { visitId, status: 'OPEN' }
    });

    if (!invoice) {
        const visit = await this.db.visit.findUnique({ where: { id: visitId } });
        if (visit) {
            invoice = await this.db.invoice.create({
                data: {
                    visitId,
                    patientId: visit.patientId,
                    status: 'OPEN',
                    totalAmount: 0,
                    balance: 0
                }
            });
        }
    }

    // 3. Add the Bill Item
    const item = await this.db.billItem.create({
      data: {
        visitId,
        invoiceId: invoice?.id,
        description,
        unitPrice,
        quantity,
        totalPrice,
        category,
        inventoryItemId,
        status: 'UNPAID'
      }
    });

    // 4. Update Invoice Totals
    if (invoice) {
        await this.db.invoice.update({
            where: { id: invoice.id },
            data: {
                totalAmount: { increment: totalPrice },
                balance: { increment: totalPrice }
            }
        });
    }

    return item;
  }
}
