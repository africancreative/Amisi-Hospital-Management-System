import { z } from 'zod';
import { tenantProcedure, protectedProcedure, router } from '@/server/trpc/trpc';

/**
 * Communication Router
 * 
 * Handles staff-to-patient chat, clinical documentation (SOAP),
 * and the unified chronological medical timeline.
 */
export const communicationRouter: any = router({
  /**
   * getTimeline
   * Aggregates Chats, Notes, Vitals, and Lab results into a unified feed.
   */
  getTimeline: tenantProcedure
    .input(z.object({
      patientId: z.string(),
      limit: z.number().min(1).max(100).default(50),
      cursor: z.string().nullish(),
    }))
    .query(async ({ ctx, input }: any) => {
      const { patientId } = input;

      // 1. Fetch diverse clinical events in parallel
      const [chats, notes, vitals, labs] = await Promise.all([
        ctx.db!.chatMessage.findMany({
          where: { patientId },
          include: { attachments: true },
          orderBy: { timestamp: 'desc' },
          take: input.limit,
        }),
        ctx.db!.clinicalNote.findMany({
          where: { patientId },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
        }),
        ctx.db!.vitals.findMany({
          where: { patientId },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
        }),
        ctx.db!.labOrder.findMany({
          where: { patientId },
          include: { results: true },
          orderBy: { createdAt: 'desc' },
          take: input.limit,
        }),
      ]);

      // 2. Map into a unified TimelineItem interface
      const timeline = [
        ...chats.map((c: any) => ({
          id: c.id,
          type: 'CHAT' as const,
          date: c.timestamp,
          content: c.content,
          author: c.authorName,
          authorRole: c.authorRole,
          metadata: { attachments: c.attachments, isClinical: c.isClinical },
        })),
        ...notes.map((n: any) => ({
          id: n.id,
          type: 'NOTE' as const,
          date: n.createdAt,
          content: n.content || `${n.type} Note Recorded`,
          author: 'Clinician', // Author names to be resolved via Employee model joins if needed
          metadata: { 
            soap: { s: n.subjective, o: n.objective, a: n.assessment, p: n.plan },
            type: n.type 
          },
        })),
        ...vitals.map((v: any) => ({
          id: v.id,
          type: 'VITALS' as const,
          date: v.createdAt,
          content: `Vitals recorded: BP ${v.bloodPressure}, HR ${v.heartRate}`,
          metadata: { bp: v.bloodPressure, hr: v.heartRate, temp: v.temperature },
        })),
        ...labs.map((l: any) => ({
          id: l.id,
          type: 'LAB' as const,
          date: l.createdAt,
          content: `Lab Order: ${l.testPanelId} (${l.status})`,
          metadata: { testCount: l.results.length },
        })),
      ].sort((a, b) => b.date.getTime() - a.date.getTime()); // Chronological sort

      return timeline.slice(0, input.limit);
    }),

  /**
   * createSoapNote
   * Encapsulates structured doctor-authored recordings.
   */
  createSoapNote: protectedProcedure
    .input(z.object({
      patientId: z.string(),
      visitId: z.string().optional(),
      encounterId: z.string().optional(),
      subjective: z.string().optional(),
      objective: z.string().optional(),
      assessment: z.string().optional(),
      plan: z.string().optional(),
      type: z.enum(['SOAP', 'NURSING', 'PROGRESS', 'CONSULT']).default('SOAP'),
    }))
    .mutation(async ({ ctx, input }: any) => {
      return ctx.db!.clinicalNote.create({
        data: {
          ...input,
          authorId: ctx.session?.userId || 'SYSTEM', // Maps to Employee.id
          version: 1,
          isSynced: false,
        }
      });
    }),

  /**
   * sendPatientMessage
   * Handles clinical chat with support for multimedia attachments.
   */
  sendPatientMessage: protectedProcedure
    .input(z.object({
      patientId: z.string(),
      content: z.string(),
      isClinical: z.boolean().default(true),
      attachments: z.array(z.object({
        url: z.string(),
        fileName: z.string(),
        type: z.enum(['image', 'voice', 'video', 'document']),
        fileSize: z.number().optional(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      const { attachments, ...rest } = input;
      
      const message = await ctx.db!.chatMessage.create({
        data: {
          ...rest,
          authorId: ctx.session?.userId || 'SYSTEM',
          authorName: 'Medical Staff', // Simplified placeholder as name is not in base session
          authorRole: ctx.session?.role || 'DOCTOR',
          attachments: attachments ? {
            create: attachments
          } : undefined,
        },
        include: { attachments: true }
      });

      return message;
    }),
});
