import { tenantProcedure, router } from '@/server/trpc/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export const wardRouter = router({
  /**
   * getWardsWithBeds
   * Fetches all wards and their constituent beds with real-time occupancy.
   */
  getWardsWithBeds: tenantProcedure
    .query(async ({ ctx }) => {
      return ctx.db.ward.findMany({
        include: {
          beds: {
            include: {
              admissions: {
                where: { status: 'ADMITTED' },
                include: {
                  encounter: {
                    include: { patient: true }
                  }
                }
              }
            },
            orderBy: { number: 'asc' }
          }
        }
      });
    }),

  /**
   * admitToBed
   * Assigns a patient (via encounter) to a specific bed.
   */
  admitToBed: tenantProcedure
    .input(z.object({
      encounterId: z.string(),
      bedId: z.string(),
      attendingPhysicianId: z.string().optional(),
      admissionReason: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        // 1. Check bed availability
        const bed = await tx.bed.findUnique({
          where: { id: input.bedId }
        });

        if (!bed || bed.status !== 'AVAILABLE') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Target bed is not available for admission'
          });
        }

        // 2. Create Admission Record
        const admission = await tx.admission.create({
          data: {
            encounterId: input.encounterId,
            bedId: input.bedId,
            status: 'ADMITTED',
            admissionReason: input.admissionReason,
            attendingPhysicianId: input.attendingPhysicianId
          }
        });

        // 3. Update Bed Status
        await tx.bed.update({
          where: { id: input.bedId },
          data: { status: 'OCCUPIED' }
        });

        return admission;
      });
    }),

  /**
   * transferPatient
   * Moves an admitted patient from one bed to another.
   */
  transferPatient: tenantProcedure
    .input(z.object({
      admissionId: z.string(),
      fromBedId: z.string(),
      toBedId: z.string(),
      reason: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        // 1. Check target bed
        const toBed = await tx.bed.findUnique({ where: { id: input.toBedId } });
        if (!toBed || toBed.status !== 'AVAILABLE') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Target bed is not available' });
        }

        // 2. Create Transfer Event
        await tx.adtTransferEvent.create({
          data: {
            admissionId: input.admissionId,
            fromBedId: input.fromBedId,
            toBedId: input.toBedId,
            reasonForTransfer: input.reason
          }
        });

        // 3. Update Admission pointer
        await tx.admission.update({
          where: { id: input.admissionId },
          data: { bedId: input.toBedId }
        });

        // 4. Swap Bed Statuses
        await tx.bed.update({ where: { id: input.fromBedId }, data: { status: 'AVAILABLE' } });
        await tx.bed.update({ where: { id: input.toBedId }, data: { status: 'OCCUPIED' } });

        return { success: true };
      });
    }),

  /**
   * dischargePatient
   * Finalizes an admission and frees the bed.
   */
  dischargePatient: tenantProcedure
    .input(z.object({
      admissionId: z.string(),
      bedId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        // 1. Update Admission status
        await tx.admission.update({
          where: { id: input.admissionId },
          data: { 
            status: 'DISCHARGED',
            dischargedAt: new Date()
          }
        });

        // 2. Free the bed (Set to CLEANING first per hospital protocol)
        await tx.bed.update({
          where: { id: input.bedId },
          data: { status: 'CLEANING' }
        });

        return { success: true };
      });
    })
});
