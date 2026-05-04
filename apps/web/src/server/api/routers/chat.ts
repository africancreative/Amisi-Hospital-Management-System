import { z } from 'zod';
import { tenantProcedure, protectedProcedure, router } from '@/server/trpc/trpc';
import { TRPCError } from '@trpc/server';

/**
 * Patient Communication & Clinical Notes Router
 * A. Patient Chat   — timeline view, multimedia, thread replies, read receipts
 * B. Clinical Notes — structured SOAP records, doctor-authored and lock-signed
 */
export const chatRouter: any = router({

  // ─────────────────────────────────────────────────────────
  // A. PATIENT CHAT
  // ─────────────────────────────────────────────────────────

  /** Fetch full message thread for a patient (timeline order) */
  getPatientMessages: protectedProcedure
    .input(z.object({
      patientId: z.string(),
      limit: z.number().min(1).max(200).default(50),
      cursor: z.string().optional(), // Last message ID for pagination
    }))
    .query(async ({ ctx, input }: any) => {
      if (!ctx.db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      const messages = await ctx.db.chatMessage.findMany({
        where: { patientId: input.patientId, isDeleted: false, replyToId: null }, // Only top-level
        take: input.limit,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        skip: input.cursor ? 1 : 0,
        orderBy: { timestamp: 'asc' },
        include: {
          attachments: true,
          replies: {
            where: { isDeleted: false },
            include: { attachments: true },
            orderBy: { timestamp: 'asc' }
          }
        }
      });
      return {
        messages,
        nextCursor: messages.length === input.limit ? messages[messages.length - 1].id : null
      };
    }),

  /** Send a message (text or system-generated) to a patient thread */
  sendPatientMessage: protectedProcedure
    .input(z.object({
      patientId: z.string(),
      content: z.string().min(1).max(5000),
      messageType: z.enum(['TEXT', 'IMAGE', 'VOICE', 'VIDEO', 'FILE', 'SYSTEM']).default('TEXT'),
      replyToId: z.string().optional(),
      isClinical: z.boolean().default(false),
      authorName: z.string(),
      authorRole: z.string(),
      // Attachment metadata (URLs assumed already uploaded to storage)
      attachment: z.object({
        type: z.string(),
        url: z.string().url(),
        fileName: z.string().optional(),
        fileSize: z.number().optional(),
        mimeType: z.string().optional(),
        thumbnail: z.string().optional(),
        duration: z.number().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      if (!ctx.db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      const { attachment, ...msgData } = input;

      const message = await ctx.db.chatMessage.create({
        data: {
          ...msgData,
          authorId: ctx.session.userId!,
          attachments: attachment ? { create: attachment } : undefined,
        },
        include: { attachments: true }
      });

      // Fire timeline event
      await ctx.db.patientTimelineEvent.create({
        data: {
          patientId: input.patientId,
          eventType: 'MESSAGE_SENT',
          title: `${input.isClinical ? 'Clinical message' : 'Message'} from ${input.authorRole}`,
          description: input.content.slice(0, 100),
          actorId: ctx.session.userId,
          actorName: input.authorName,
          actorRole: input.authorRole,
        }
      });

      return message;
    }),

  /** Mark a patient message as read */
  markMessageRead: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }: any) => {
      if (!ctx.db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      return ctx.db.chatMessage.update({
        where: { id: input },
        data: { isRead: true, readAt: new Date() }
      });
    }),

  /** Soft-delete a message */
  deletePatientMessage: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }: any) => {
      if (!ctx.db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      return ctx.db.chatMessage.update({
        where: { id: input },
        data: { isDeleted: true, content: '[Message deleted]' }
      });
    }),

  // ─────────────────────────────────────────────────────────
  // A2. PATIENT TIMELINE
  // ─────────────────────────────────────────────────────────

  /** Unified timeline: messages + visits + notes + labs + payments */
  getPatientTimeline: protectedProcedure
    .input(z.object({
      patientId: z.string(),
      limit: z.number().default(100),
      eventTypes: z.array(z.string()).optional(),
    }))
    .query(async ({ ctx, input }: any) => {
      if (!ctx.db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      return ctx.db.patientTimelineEvent.findMany({
        where: {
          patientId: input.patientId,
          ...(input.eventTypes ? { eventType: { in: input.eventTypes } } : {})
        },
        orderBy: { occurredAt: 'desc' },
        take: input.limit,
      });
    }),

  // ─────────────────────────────────────────────────────────
  // B. CLINICAL NOTES
  // ─────────────────────────────────────────────────────────

  /** Fetch all clinical notes for a patient */
  getPatientNotes: protectedProcedure
    .input(z.object({
      patientId: z.string(),
      type: z.enum(['SOAP', 'NURSING', 'PROGRESS', 'CONSULT', 'DISCHARGE']).optional(),
    }))
    .query(async ({ ctx, input }: any) => {
      if (!ctx.db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      return ctx.db.clinicalNote.findMany({
        where: { patientId: input.patientId, ...(input.type ? { type: input.type } : {}) },
        orderBy: { createdAt: 'desc' },
        include: { author: { select: { id: true, firstName: true, lastName: true, role: true } } }
      });
    }),

  /** Create a new clinical note (draft — unlocked, editable) */
  createClinicalNote: protectedProcedure
    .input(z.object({
      patientId: z.string(),
      visitId: z.string().optional(),
      encounterId: z.string().optional(),
      type: z.enum(['SOAP', 'NURSING', 'PROGRESS', 'CONSULT', 'DISCHARGE']).default('SOAP'),
      subjective: z.string().optional(),
      objective: z.string().optional(),
      assessment: z.string().optional(),
      plan: z.string().optional(),
      content: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      if (!ctx.db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      if (!ctx.session.userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const note = await ctx.db.clinicalNote.create({
        data: {
          ...input,
          authorId: ctx.session.userId,
          isLocked: false,
          version: 1,
          isSynced: false,
        }
      });

      await ctx.db.patientTimelineEvent.create({
        data: {
          patientId: input.patientId,
          visitId: input.visitId,
          encounterId: input.encounterId,
          clinicalNoteId: note.id,
          eventType: 'NOTE_ADDED',
          title: `${input.type} Note created`,
          description: input.assessment || input.content,
          actorId: ctx.session.userId,
          actorRole: ctx.session.role,
        }
      });

      return note;
    }),

  /** Update a clinical note (only if NOT locked) */
  updateClinicalNote: protectedProcedure
    .input(z.object({
      noteId: z.string(),
      subjective: z.string().optional(),
      objective: z.string().optional(),
      assessment: z.string().optional(),
      plan: z.string().optional(),
      content: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      if (!ctx.db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      const { noteId, ...data } = input;

      const existing = await ctx.db.clinicalNote.findUnique({ where: { id: noteId } });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND', message: 'Note not found' });
      if (existing.isLocked) throw new TRPCError({ code: 'FORBIDDEN', message: 'This note has been signed and locked. Create an addendum instead.' });
      if (existing.authorId !== ctx.session.userId) throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only edit your own notes.' });

      return ctx.db.clinicalNote.update({
        where: { id: noteId },
        data: { ...data, version: { increment: 1 }, updatedAt: new Date() }
      });
    }),

  /** Doctor signs and locks a note — irreversible */
  signAndLockNote: protectedProcedure
    .input(z.object({
      noteId: z.string(),
      signedByName: z.string(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      if (!ctx.db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

      const existing = await ctx.db.clinicalNote.findUnique({ where: { id: input.noteId } });
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });
      if (existing.isLocked) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Note already signed.' });
      if (existing.authorId !== ctx.session.userId) throw new TRPCError({ code: 'FORBIDDEN' });

      return ctx.db.clinicalNote.update({
        where: { id: input.noteId },
        data: { isLocked: true, signedAt: new Date(), signedByName: input.signedByName }
      });
    }),

  // ─────────────────────────────────────────────────────────
  // INTERNAL STAFF CHAT (unchanged, preserved)
  // ─────────────────────────────────────────────────────────
  getUserConversations: protectedProcedure
    .query(async ({ ctx }: any) => {
      const userId = ctx.session.userId;
      const sent = await ctx.db!.userChatMessage.findMany({
        where: { senderId: userId },
        distinct: ['receiverId'],
        include: { receiver: true }
      });
      const received = await ctx.db!.userChatMessage.findMany({
        where: { receiverId: userId },
        distinct: ['senderId'],
        include: { sender: true }
      });
      return { sent, received };
    }),

  sendUserMessage: protectedProcedure
    .input(z.object({
      receiverId: z.string(),
      content: z.string(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      return ctx.db!.userChatMessage.create({
        data: { ...input, senderId: ctx.session.userId! }
      });
    }),
});
