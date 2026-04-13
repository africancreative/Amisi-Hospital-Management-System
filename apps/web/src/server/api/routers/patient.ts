import { z } from 'zod';
import { tenantProcedure, router, protectedProcedure, clinicalProcedure } from '@/server/trpc/trpc';
import { logAudit } from '@/lib/audit';

/**
 * Patient CRUD Router
 * 
 * Secure procedures with built-in HIPAA auditing.
 */
export const patientRouter = router({
  list: clinicalProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.string().nullish(),
      search: z.string().nullish(),
    }))
    .query(async ({ ctx, input }) => {
      const { limit, cursor, search } = input;
      const take = limit ?? 50;

      const items = await ctx.db.patient.findMany({
        take: take + 1,
        where: search ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { mrn: { contains: search, mode: 'insensitive' } },
          ],
        } : undefined,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      });

      // Audit Page Access
      await logAudit({
        action: 'READ',
        resource: 'PATIENT_LIST',
        details: { search, resultCount: items.length }
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > take) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),

  getById: clinicalProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const patient = await ctx.db.patient.findUnique({
        where: { id: input },
        include: {
          encounters: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (patient) {
        // Audit Individual Access (High Sensitivity)
        await logAudit({
          action: 'ACCESS',
          resource: 'PATIENT',
          resourceId: patient.id,
          details: { mrn: patient.mrn, name: `${patient.firstName} ${patient.lastName}` }
        });
      }

      return patient;
    }),

  create: clinicalProcedure
    .input(z.object({
      firstName: z.string(),
      lastName: z.string(),
      dob: z.date(),
      gender: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      mrn: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const patient = await ctx.db.patient.create({
        data: {
          ...input,
          version: 1,
          isSynced: false,
        },
      });

      await logAudit({
        action: 'CREATE',
        resource: 'PATIENT',
        resourceId: patient.id,
        details: { mrn: patient.mrn }
      });

      return patient;
    }),

  update: clinicalProcedure
    .input(z.object({
      id: z.string(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      dob: z.date().optional(),
      gender: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const patient = await ctx.db.patient.update({
        where: { id },
        data: {
          ...data,
          version: { increment: 1 },
          isSynced: false,
        },
      });

      await logAudit({
        action: 'UPDATE',
        resource: 'PATIENT',
        resourceId: patient.id,
        details: { changedFields: Object.keys(data) }
      });

      return patient;
    }),
});

