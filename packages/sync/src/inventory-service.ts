import { TenantClient as PrismaClient } from '@amisimedos/db';

/**
 * Inventory Automation Service
 * 
 * Manages physical stock levels with clinical intelligence (FEFO).
 * Ensures that medications and supplies are deducted correctly from the 
 * earliest-expiry batches during the billing process.
 */
export class InventoryService {
  constructor(private db: any) {}

  /**
   * Automatically deducts stock from an inventory item using FEFO.
   * Decrements from batches with the closest expiry date first.
   */
  async decrementStockWithFEFO(params: {
    itemId: string;
    quantity: number;
    reason: string;
    visitId?: string;
    dispensedBy: string;
  }) {
    const { itemId, quantity, reason, visitId, dispensedBy } = params;

    return await this.db.$transaction(async (tx: any) => {
      // 1. Fetch Item & Valid Batches (Sorted by Expiry ASC)
      const item = await tx.inventoryItem.findUnique({
        where: { id: itemId },
        include: {
          batches: {
            where: { quantity: { gt: 0 } },
            orderBy: { expiryDate: 'asc' }
          }
        }
      });

      if (!item) throw new Error(`Inventory Item ${itemId} not found`);
      if (item.quantity < quantity) {
        throw new Error(`Insufficient stock for ${item.name}. Required: ${quantity}, Available: ${item.quantity}`);
      }

      let remainingToDeduct = quantity;
      const deductions = [];

      // 2. Iterate through batches to fulfill quantity (FEFO)
      for (const batch of item.batches) {
        if (remainingToDeduct <= 0) break;

        const deductFromThisBatch = Math.min(batch.quantity, remainingToDeduct);
        
        // Update Batch
        await tx.inventoryBatch.update({
          where: { id: batch.id },
          data: { quantity: { decrement: deductFromThisBatch } }
        });

        deductions.push({
            batchId: batch.id,
            quantity: deductFromThisBatch
        });

        remainingToDeduct -= deductFromThisBatch;
      }

      // 3. Update main Item total
      await tx.inventoryItem.update({
        where: { id: itemId },
        data: { quantity: { decrement: quantity } }
      });

      // 4. Create Dispensing Record/Audit Log
      const record = await tx.dispensingRecord.create({
        data: {
          itemId,
          quantityDispensed: quantity,
          dispensedBy,
          // visitId: visitId, // Mapping visit context if available
        }
      });

      return { record, deductions };
    });
  }
}
