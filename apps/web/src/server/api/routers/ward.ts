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
      return ctx.db!.ward.findMany({
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
      return ctx.db!.$transaction(async (tx) => {
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

        // 4. Timeline Event
        const encounter = await tx.encounter.findUnique({ 
          where: { id: input.encounterId },
          include: { patient: true }
        });

        if (encounter) {
          await tx.patientTimelineEvent.create({
            data: {
              patientId: encounter.patientId,
              eventType: 'ADMISSION_CREATED',
              title: 'Patient Admitted',
              description: `Admitted to ${bed.number} (${bed.wardId}). Reason: ${input.admissionReason || 'Clinical Management'}`,
              actorId: ctx.session.userId,
              actorRole: ctx.session.role,
              encounterId: input.encounterId,
              visitId: encounter.visitId
            }
          });
        }

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
      return ctx.db!.$transaction(async (tx) => {
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

        // 5. Timeline Event
        const admission = await tx.admission.findUnique({
          where: { id: input.admissionId },
          include: { encounter: true }
        });

        if (admission?.encounter) {
          await tx.patientTimelineEvent.create({
            data: {
              patientId: admission.encounter.patientId,
              eventType: 'PATIENT_TRANSFERRED',
              title: 'Bed Transfer',
              description: `Transferred from bed ${input.fromBedId} to ${input.toBedId}. Reason: ${input.reason || 'None provided'}`,
              actorId: ctx.session.userId,
              actorRole: ctx.session.role,
              encounterId: admission.encounterId,
              visitId: admission.encounter.visitId
            }
          });
        }

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
      return ctx.db!.$transaction(async (tx) => {
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

        // 3. Timeline Event
        const admission = await tx.admission.findUnique({
          where: { id: input.admissionId },
          include: { encounter: true }
        });

        if (admission?.encounter) {
          await tx.patientTimelineEvent.create({
            data: {
              patientId: admission.encounter.patientId,
              eventType: 'DISCHARGE_FINALIZED',
              title: 'Patient Discharged',
              description: 'Inpatient admission finalized. Patient discharged from ward.',
              actorId: ctx.session.userId,
              actorRole: ctx.session.role,
              encounterId: admission.encounterId,
              visitId: admission.encounter.visitId
            }
          });
        }

        return { success: true };
      });
    }),

  /**
   * markBedClean
   * Transitions a bed from 'CLEANING' back to 'AVAILABLE'.
   */
  markBedClean: tenantProcedure
    .input(z.object({
      bedId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db!.bed.update({
        where: { id: input.bedId },
        data: { status: 'AVAILABLE' }
      });
    }),

  /**
   * getWardOccupancy
   * High-level stats for ward management dashboard.
   */
  getWardOccupancy: tenantProcedure
    .query(async ({ ctx }) => {
      const wards = await ctx.db!.ward.findMany({
        include: {
          beds: {
            select: { status: true }
          }
        }
      });

      return wards.map(w => ({
        id: w.id,
        name: w.name,
        totalBeds: w.beds.length,
        occupied: w.beds.filter(b => b.status === 'OCCUPIED').length,
        cleaning: w.beds.filter(b => b.status === 'CLEANING').length,
        available: w.beds.filter(b => b.status === 'AVAILABLE').length,
      }));
    })
});
