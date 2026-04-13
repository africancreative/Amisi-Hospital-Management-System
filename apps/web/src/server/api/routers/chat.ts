import { z } from 'zod';
import { tenantProcedure, protectedProcedure, router } from '@/server/trpc/trpc';

/**
 * Chat Router
 * Handles Patient Chat and Internal Staff (User) Chat
 */
export const chatRouter = router({
  // --- Patient Chat (Clinical Communication) ---
  getPatientMessages: protectedProcedure
    .input(z.object({
      patientId: z.string(),
      limit: z.number().min(1).max(100).optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.chatMessage.findMany({
        where: { patientId: input.patientId },
        take: input.limit ?? 50,
        orderBy: { timestamp: 'desc' },
        include: { attachments: true }
      });
    }),

  sendPatientMessage: protectedProcedure
    .input(z.object({
      patientId: z.string(),
      content: z.string(),
      authorName: z.string(),
      authorRole: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.chatMessage.create({
        data: {
          ...input,
          authorId: ctx.session.userId,
        }
      });
    }),

  // --- Internal Staff Chat (User-to-User) ---
  getUserConversations: protectedProcedure
    .query(async ({ ctx }) => {
      // Logic to find all users that have exchanged messages with current user
      const userId = ctx.session.userId;
      
      const sent = await ctx.db.userChatMessage.findMany({
        where: { senderId: userId },
        distinct: ['receiverId'],
        include: { receiver: true }
      });

      const received = await ctx.db.userChatMessage.findMany({
        where: { receiverId: userId },
        distinct: ['senderId'],
        include: { sender: true }
      });

      // Filter and merge for a unique list of counterparties
      return { sent, received };
    }),

  sendUserMessage: protectedProcedure
    .input(z.object({
      receiverId: z.string(),
      content: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.userChatMessage.create({
        data: {
          ...input,
          senderId: ctx.session.userId,
        }
      });
    }),
});
