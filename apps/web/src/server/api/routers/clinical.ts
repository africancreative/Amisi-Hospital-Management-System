import { tenantProcedure, router } from '@/server/trpc/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { BillingService } from '@amisimedos/sync/billing-service';

/**
 * Unified Clinical Router
 * 
 * Manages workflows for OPD, ED, IPD, and Diagnostics.
 * Strict Rule: Every clinical step generates a financial BillItem and a ClinicalNote.
 */
export const clinicalRouter = router({
  
  /**
   * OPD / ED Registration
   * Initializes a patient visit and creates a 'Registration Fee'.
   */
  startVisit: tenantProcedure
    .input(z.object({
      patientId: z.string(),
      type: z.enum(['OUTPATIENT', 'EMERGENCY']),
      reason: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const billing = new BillingService(ctx.db);

      // 1. Create the Visit
      const visit = await ctx.db!.visit.create({
        data: {
          ...input,
          status: 'OPEN',
          admittedAt: new Date(),
        }
      });

      // 2. Automated Billing: Registration Fee
      const fee = input.type === 'EMERGENCY' ? 25.00 : 15.00;
      await billing.recordServiceCharge({
        visitId: visit.id,
        description: `${input.type} Registration Fee`,
        unitPrice: fee,
        category: 'PROCEDURE'
      });

      // 3. Collaborative Documentation: Initial Note
      await ctx.db!.clinicalNote.create({
        data: {
          visitId: visit.id,
          patientId: input.patientId,
          authorId: ctx.session.userId!,
          type: 'CONSULT',
          subjective: `Patient presented for ${input.type.toLowerCase()} care. Reason: ${input.reason || 'Not specified'}.`,
        }
      });

      return visit;
    }),

  /**
   * Triage Module (Standardized for ED/OPD)
   * Logs vitals, ESI level, and creates a 'Triage Fee'.
   */
  recordTriage: tenantProcedure
    .input(z.object({
      visitId: z.string(),
      esiLevel: z.number().optional(),
      triageNotes: z.string(),
      vitals: z.object({
        temp: z.number(),
        hr: z.number(),
        rr: z.number(),
        bp: z.string(),
        spo2: z.number()
      })
    }))
    .mutation(async ({ ctx, input }) => {
      const billing = new BillingService(ctx.db);

      // 1. Find Visit for patient data
      const visit = await ctx.db!.visit.findUnique({ where: { id: input.visitId } });
      if (!visit) throw new TRPCError({ code: 'NOT_FOUND' });

      // 2. Create Encounter (Triage stage)
      const encounter = await ctx.db!.encounter.create({
        data: {
          patientId: visit.patientId,
          visitId: visit.id,
          type: visit.type === 'EMERGENCY' ? 'Emergency' : 'Checkup',
          doctorName: 'Pending Assignment',
          esiLevel: input.esiLevel,
          triageNotes: input.triageNotes,
          triageStartedAt: new Date(),
          vitals: {
            create: {
              patientId: visit.patientId,
              temperature: input.vitals.temp,
              heartRate: input.vitals.hr,
              respiratoryRate: input.vitals.rr,
              bloodPressure: input.vitals.bp,
              spO2: input.vitals.spo2
            }
          }
        }
      });

      // 3. Billing: Triage Fee
      await billing.recordServiceCharge({
        visitId: visit.id,
        description: 'Standard Clinical Triage',
        unitPrice: 10.00,
        category: 'PROCEDURE'
      });

      // 4. Collaborative Note
      await ctx.db!.clinicalNote.create({
        data: {
          visitId: visit.id,
          encounterId: encounter.id,
          patientId: visit.patientId,
          authorId: ctx.session.userId!,
          type: 'NURSING',
          objective: `Triage completed. ESI Level: ${input.esiLevel || 'N/A'}. BP: ${input.vitals.bp}.`,
          content: input.triageNotes
        }
      });

      return encounter;
    }),

  /**
   * IPD Admission
   * Transfers a patient from ER/OPD to a Ward. Creates 'Admission Fee'.
   */
  admitToWard: tenantProcedure
    .input(z.object({
      encounterId: z.string(),
      bedId: z.string(),
      reason: z.string(),
      physicianId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const billing = new BillingService(ctx.db);

      // 1. Fetch Encounter
      const encounter = await ctx.db!.encounter.findUnique({ 
        where: { id: input.encounterId },
        include: { visit: true }
      });
      if (!encounter || !encounter.visitId) throw new TRPCError({ code: 'NOT_FOUND' });

      // 2. Create Admission
      const admission = await ctx.db!.admission.create({
        data: {
          encounterId: input.encounterId,
          bedId: input.bedId,
          admissionReason: input.reason,
          attendingPhysicianId: input.physicianId,
          status: 'ADMITTED',
          admittedAt: new Date()
        }
      });

      // 3. Update Bed Status
      await ctx.db!.bed.update({
        where: { id: input.bedId },
        data: { status: 'OCCUPIED' }
      });

      // 4. Billing: Admission Deposit
      await billing.recordServiceCharge({
        visitId: encounter.visitId,
        description: 'IPD Admission Service Fee',
        unitPrice: 100.00,
        category: 'PROCEDURE'
      });

      return admission;
    }),

  /**
   * Diagnostic Orders (Lab/Radiology)
   * Creates an order and automatically bills it.
   */
  orderDiagnostic: tenantProcedure
    .input(z.object({
      visitId: z.string(),
      encounterId: z.string().optional(),
      category: z.enum(['LAB', 'RADIOLOGY']),
      testName: z.string(),
      price: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const billing = new BillingService(ctx.db);

      // 1. Fetch Visit
      const visit = await ctx.db!.visit.findUnique({ where: { id: input.visitId } });
      if (!visit) throw new TRPCError({ code: 'NOT_FOUND' });

      // 2. Create Diagnostic Order
      const order = await ctx.db!.diagnosticOrder.create({
        data: {
          patientId: visit.patientId,
          encounterId: input.encounterId,
          category: input.category,
          testName: input.testName,
          status: 'pending',
          orderedBy: ctx.session.userId!,
        }
      });

      // 3. Billing: Automated Charge
      await billing.recordServiceCharge({
        visitId: visit.id,
        description: `${input.category}: ${input.testName}`,
        unitPrice: input.price,
        category: input.category
      });

      // 4. Clinical Chat: Auto-post order to team
      await ctx.db!.chatMessage.create({
        data: {
          patientId: visit.patientId,
          authorId: 'SYSTEM',
          authorName: 'System Agent',
          authorRole: 'SYSTEM',
          content: `New ${input.category} order created: ${input.testName}. Status: Pending.`,
          isSystemGenerated: true
        }
      });

      return order;
    }),

  /**
   * Data Retrieval: Fetch all records for a visit
   */
  getVisitNotes: tenantProcedure
    .input(z.object({ visitId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db!.clinicalNote.findMany({
        where: { visitId: input.visitId },
        orderBy: { createdAt: 'desc' },
        include: { author: true }
      });
    }),

  getVisitEncounters: tenantProcedure
    .input(z.object({ visitId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db!.encounter.findMany({
        where: { visitId: input.visitId },
        orderBy: { createdAt: 'desc' },
        include: { vitals: true, admission: true }
      });
    })
});
