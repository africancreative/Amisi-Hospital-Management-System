import { tenantProcedure, router } from '@/server/trpc/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const pharmacyRouter = router({
  /**
   * getInventory
   * Fetches the current stock levels across all pharmacy locations.
   */
  getInventory: tenantProcedure
    .query(async ({ ctx }) => {
      return ctx.db!.pharmacyInventory.findMany({
        include: {
          medication: true
        },
        orderBy: { expiryDate: 'asc' } // FEFO: First Expiry First Out
      });
    }),

  /**
   * getPendingPrescriptions
   * Returns prescriptions that have not been fully dispensed yet.
   */
  getPendingPrescriptions: tenantProcedure
    .query(async ({ ctx }) => {
      return ctx.db!.prescription.findMany({
        where: {
          status: { in: ['pending', 'partial'] }
        },
        include: {
          patient: true,
          items: true
        },
        orderBy: { createdAt: 'desc' }
      });
    }),

  /**
   * dispenseMedication
   * Process a dispensation, updating inventory and triggering billing.
   */
  dispenseMedication: tenantProcedure
    .input(z.object({
      prescriptionId: z.string(),
      inventoryId: z.string(),
      quantity: z.number(),
      pharmacistId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db!.$transaction(async (tx) => {
        // 1. Resolve Inventory Item
        const inventory = await tx.pharmacyInventory.findUnique({
          where: { id: input.inventoryId },
          include: { medication: true }
        });

        if (!inventory || inventory.quantityOnHand < input.quantity) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Insufficient stock for this medication batch'
          });
        }

        // 2. Create Dispensing Log
        const log = await tx.dispensingLog.create({
          data: {
            prescriptionId: input.prescriptionId,
            pharmacyInventoryId: input.inventoryId,
            patientId: (await tx.prescription.findUnique({ where: { id: input.prescriptionId } }))?.patientId || '',
            pharmacistId: input.pharmacistId,
            quantityDispensed: input.quantity,
            batchNumber: inventory.batchNumber,
            expiryDate: inventory.expiryDate,
            status: 'DISPENSED'
          }
        });

        // 3. Update Inventory Levels
        await tx.pharmacyInventory.update({
          where: { id: input.inventoryId },
          data: {
            quantityOnHand: { decrement: input.quantity }
          }
        });

        // 4. Update Prescription Status
        await tx.prescription.update({
          where: { id: input.prescriptionId },
          data: { status: 'dispensed' }
        });

        // 5. AUTOMATED BILLING TRIGGER
        const prescription = await tx.prescription.findUnique({
          where: { id: input.prescriptionId },
          include: { encounter: true }
        });

        if (prescription?.encounterId) {
          // Find or Create Invoice
          let invoice = await tx.invoice.findUnique({
             where: { encounterId: prescription.encounterId }
          });

          if (!invoice && prescription.patientId) {
            invoice = await tx.invoice.create({
              data: {
                patientId: prescription.patientId,
                encounterId: prescription.encounterId,
                status: 'OPEN',
                totalAmount: 0,
                balanceDue: 0
              }
            });
          }

          if (invoice && prescription.encounter?.visitId) {
             const unitPrice = Number(inventory.unitCost || 0) * 1.5; // Cost + 50% Margin markup
             await tx.billItem.create({
                data: {
                  invoiceId: invoice.id,
                  visitId: prescription.encounter.visitId,
                  description: `Pharmacy: ${inventory.medication.name} (${input.quantity} ${inventory.medication.unit})`,
                  quantity: input.quantity,
                  unitPrice,
                  totalPrice: unitPrice * input.quantity,
                  category: 'PHARMACY',
                  status: 'UNPAID'
                }
             });

             // Update Invoice Totals
             await tx.invoice.update({
                where: { id: invoice.id },
                data: {
                   totalAmount: { increment: unitPrice * input.quantity },
                   balanceDue: { increment: unitPrice * input.quantity }
                }
             });
          }
        }

        return log;
      });
    })
});
