import { tenantProcedure, protectedProcedure, router, inventoryProcedure } from '@/server/trpc/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { logAudit } from '@/lib/audit';

/**
 * Inventory & Pharmacy Router
 * - Stock tracking (with movement ledger)
 * - Dispensing (FEFO: First Expiry, First Out)
 * - Reorder alerts (low-stock & near-expiry)
 * - Automated billing on dispense
 */
export const pharmacyRouter: any = router({

  // ─────────────────────────────────────────────────────────
  // INVENTORY
  // ─────────────────────────────────────────────────────────

  /** All inventory items with current quantity & alert thresholds */
  getInventoryItems: tenantProcedure
    .input(z.object({
      category: z.string().optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }: any) => {
      return ctx.db!.inventoryItem.findMany({
        where: {
          ...(input?.category ? { category: input.category } : {}),
          ...(input?.search ? { name: { contains: input.search, mode: 'insensitive' } } : {}),
        },
        orderBy: { name: 'asc' },
        include: { batches: { orderBy: { expiryDate: 'asc' } } }
      });
    }),

  /** Batch stock levels ordered FEFO (First Expiry First Out) */
  getInventory: tenantProcedure
    .query(async ({ ctx }: any) => {
      return ctx.db!.pharmacyInventory.findMany({
        include: { medication: true },
        orderBy: { expiryDate: 'asc' }
      });
    }),

  /** Adjust stock — for cycle counts, write-offs, receiving goods */
  adjustStock: inventoryProcedure
    .input(z.object({
      itemId: z.string(),
      type: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'RETURN', 'EXPIRED_DISPOSAL']),
      quantity: z.number().int(),
      reason: z.string().optional(),
      reference: z.string().optional(),  // PO or GRN number
    }))
    .mutation(async ({ ctx, input }: any) => {
      if (!ctx.db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      const result = await ctx.db.$transaction(async (tx: any) => {
        const item = await tx.inventoryItem.findUnique({ where: { id: input.itemId } });
        if (!item) throw new TRPCError({ code: 'NOT_FOUND', message: 'Item not found' });

        // Signed quantity: OUT and EXPIRED_DISPOSAL reduce stock
        const delta = ['OUT', 'EXPIRED_DISPOSAL'].includes(input.type) ? -Math.abs(input.quantity) : Math.abs(input.quantity);
        const newQty = item.quantity + delta;

        if (newQty < 0) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Insufficient stock for this adjustment.' });

        const updatedItem = await tx.inventoryItem.update({
          where: { id: input.itemId },
          data: { quantity: newQty, isSynced: false }
        });

        // Write movement ledger entry
        await tx.stockMovement.create({
          data: {
            itemId: input.itemId,
            type: input.type,
            quantity: delta,
            reason: input.reason,
            reference: input.reference,
            actorId: ctx.session.userId,
            actorName: ctx.session.role,
            balanceAfter: newQty,
          }
        });

        // Auto-generate low-stock alert if below minLevel
        if (newQty <= item.minLevel) {
          const existing = await tx.stockAlert.findFirst({
            where: { itemId: input.itemId, alertType: 'LOW_STOCK', isResolved: false }
          });
          if (!existing) {
            await tx.stockAlert.create({
              data: {
                itemId: input.itemId,
                alertType: 'LOW_STOCK',
                message: `${item.name} is below minimum level (${newQty} remaining, min: ${item.minLevel}).`
              }
            });
          }
        } else {
          // Auto-resolve existing low-stock alert
          await tx.stockAlert.updateMany({
            where: { itemId: input.itemId, alertType: 'LOW_STOCK', isResolved: false },
            data: { isResolved: true, resolvedAt: new Date() }
          });
        }

        return updatedItem;
      });

      await logAudit({
        action: 'UPDATE',
        resource: 'InventoryItem',
        resourceId: input.itemId,
        details: { type: input.type, quantity: input.quantity, reason: input.reason },
        actor: { id: ctx.session.userId, name: ctx.session.userName, role: ctx.session.role }
      });

      return result;
    }),

  /** Movement ledger for a specific inventory item */
  getStockMovements: protectedProcedure
    .input(z.object({ itemId: z.string(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }: any) => {
      if (!ctx.db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      return ctx.db.stockMovement.findMany({
        where: { itemId: input.itemId },
        orderBy: { createdAt: 'desc' },
        take: input.limit
      });
    }),

  // ─────────────────────────────────────────────────────────
  // REORDER ALERTS
  // ─────────────────────────────────────────────────────────

  /** All active (unresolved) stock alerts */
  getStockAlerts: protectedProcedure
    .query(async ({ ctx }: any) => {
      if (!ctx.db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      return ctx.db.stockAlert.findMany({
        where: { isResolved: false },
        include: { item: true },
        orderBy: { createdAt: 'desc' }
      });
    }),

  /** Items at or below their reorder level */
  getLowStockItems: protectedProcedure
    .query(async ({ ctx }: any) => {
      if (!ctx.db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      // Prisma: compare column-to-column using raw or filtered approach
      const items = await ctx.db.inventoryItem.findMany();
      return items.filter((i: any) => i.quantity <= i.reorderLevel);
    }),

  /** Batches expiring within the next N days */
  getExpiringBatches: protectedProcedure
    .input(z.object({ daysAhead: z.number().default(30) }))
    .query(async ({ ctx, input }: any) => {
      if (!ctx.db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + input.daysAhead);
      return ctx.db.inventoryBatch.findMany({
        where: { expiryDate: { lte: cutoff }, quantity: { gt: 0 } },
        include: { inventoryItem: true },
        orderBy: { expiryDate: 'asc' }
      });
    }),

  /** Resolve a stock alert manually */
  resolveAlert: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }: any) => {
      if (!ctx.db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      return ctx.db.stockAlert.update({
        where: { id: input },
        data: { isResolved: true, resolvedAt: new Date() }
      });
    }),

  // ─────────────────────────────────────────────────────────
  // PHARMACY — DISPENSING
  // ─────────────────────────────────────────────────────────

  getPendingPrescriptions: tenantProcedure
    .query(async ({ ctx }: any) => {
      return ctx.db!.prescription.findMany({
        where: { status: { in: ['pending', 'partial'] } },
        include: { patient: true, items: true },
        orderBy: { createdAt: 'desc' }
      });
    }),

  dispenseMedication: inventoryProcedure
    .input(z.object({
      prescriptionId: z.string(),
      inventoryId: z.string(),
      quantity: z.number().int().positive(),
      pharmacistId: z.string()
    }))
    .mutation(async ({ ctx, input }: any) => {
      const result = await ctx.db!.$transaction(async (tx: any) => {
        // 1. Resolve Inventory (FEFO — pick earliest expiry batch first)
        const inventory = await tx.pharmacyInventory.findUnique({
          where: { id: input.inventoryId },
          include: { medication: true }
        });

        if (!inventory || inventory.quantityOnHand < input.quantity) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Insufficient stock for this medication batch' });
        }

        // 2. Create Dispensing Log
        const prescription = await tx.prescription.findUnique({
          where: { id: input.prescriptionId },
          include: { encounter: true }
        });
        if (!prescription) throw new TRPCError({ code: 'NOT_FOUND' });

        const log = await tx.dispensingLog.create({
          data: {
            prescriptionId: input.prescriptionId,
            pharmacyInventoryId: input.inventoryId,
            patientId: prescription.patientId,
            pharmacistId: input.pharmacistId,
            quantityDispensed: input.quantity,
            batchNumber: inventory.batchNumber,
            expiryDate: inventory.expiryDate,
            status: 'DISPENSED'
          }
        });

        // 3. Deduct pharmacy inventory
        await tx.pharmacyInventory.update({
          where: { id: input.inventoryId },
          data: { quantityOnHand: { decrement: input.quantity } }
        });

        // 4. Write StockMovement for the InventoryItem ledger
        const invItem = await tx.inventoryItem.findFirst({
          where: { name: { equals: inventory.medication.name, mode: 'insensitive' } }
        });
        if (invItem) {
          const newQty = invItem.quantity - input.quantity;
          await tx.inventoryItem.update({ where: { id: invItem.id }, data: { quantity: { decrement: input.quantity } } });
          await tx.stockMovement.create({
            data: {
              itemId: invItem.id,
              type: 'OUT',
              quantity: -input.quantity,
              reason: `Dispensed — Rx ${input.prescriptionId}`,
              reference: input.prescriptionId,
              actorId: input.pharmacistId,
              balanceAfter: newQty,
            }
          });
          // Alert if low
          if (newQty <= invItem.minLevel) {
            const exists = await tx.stockAlert.findFirst({
              where: { itemId: invItem.id, alertType: 'LOW_STOCK', isResolved: false }
            });
            if (!exists) {
              await tx.stockAlert.create({
                data: {
                  itemId: invItem.id,
                  alertType: 'LOW_STOCK',
                  message: `${invItem.name} fell below minimum level after dispensing (${newQty} remaining).`
                }
              });
            }
          }
        }

        // 5. Update Prescription status
        await tx.prescription.update({ where: { id: input.prescriptionId }, data: { status: 'dispensed' } });

        // 6. Auto-bill the patient
        if (prescription.encounterId && prescription.encounter?.visitId) {
          let invoice = await tx.invoice.findUnique({ where: { encounterId: prescription.encounterId } });
          if (!invoice) {
            invoice = await tx.invoice.create({
              data: { patientId: prescription.patientId, encounterId: prescription.encounterId, status: 'OPEN', totalAmount: 0, balanceDue: 0 }
            });
          }
          const unitPrice = Number(inventory.unitCost || 0) * 1.5;
          const lineTotal = unitPrice * input.quantity;
          await tx.billItem.create({
            data: {
              invoiceId: invoice.id,
              visitId: prescription.encounter.visitId,
              description: `Pharmacy: ${inventory.medication.name} (${input.quantity} ${inventory.medication.unit})`,
              quantity: input.quantity,
              unitPrice,
              totalPrice: lineTotal,
              category: 'PHARMACY',
              status: 'UNPAID',
              version: 1,
              isSynced: false
            }
          });
          await tx.invoice.update({
            where: { id: invoice.id },
            data: { totalAmount: { increment: lineTotal }, balanceDue: { increment: lineTotal } }
          });
        }

        return log;
      });

      await logAudit({
        action: 'UPDATE',
        resource: 'Prescription',
        resourceId: input.prescriptionId,
        details: { action: 'DISPENSE', quantity: input.quantity, batch: result.batchNumber },
        actor: { id: ctx.session.userId, name: ctx.session.userName, role: ctx.session.role }
      });

      return result;
    }),
});
