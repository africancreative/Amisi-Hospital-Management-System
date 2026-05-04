import { z } from 'zod';
import { tenantProcedure, protectedProcedure, router } from '@/server/trpc/trpc';
import { realtimeHub } from '@amisimedos/chat';

/**
 * Internal Chat Router
 * 
 * Handles staff-to-staff messaging, group clinical collaboration,
 * multimedia attachments, and ephemeral message lifecycle.
 */
export const internalChatRouter: any = router({
  /**
   * getConversations
   * Fetches active groups and DMs for the current employee.
   */
  getConversations: tenantProcedure
    .query(async ({ ctx }: any) => {
      const userId = ctx.session?.userId;
      if (!userId) throw new Error('Unauthorized');

      return ctx.db!.chatGroup.findMany({
        where: {
          members: {
            some: { userId }
          }
        },
        include: {
          members: {
            include: { user: { select: { firstName: true, lastName: true, role: true } } }
          },
          messages: {
            orderBy: { timestamp: 'desc' },
            take: 1
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }),

  /**
   * getMessages
   * Paginated history for a specific chat group.
   */
  getMessages: tenantProcedure
    .input(z.object({
      groupId: z.string(),
      limit: z.number().min(1).max(100).default(50),
      cursor: z.string().nullish(),
    }))
    .query(async ({ ctx, input }: any) => {
      const messages = await ctx.db!.userChatMessage.findMany({
        where: { 
            groupId: input.groupId,
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
            ]
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { timestamp: 'desc' },
        include: { attachments: true }
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (messages.length > input.limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem!.id;
      }

      return {
        messages: messages.reverse(),
        nextCursor,
      };
    }),

  /**
   * sendMessage
   * Dispatches message to DB and broadcasts via RealtimeHub (SSE).
   */
  sendMessage: protectedProcedure
    .input(z.object({
      groupId: z.string(),
      content: z.string(),
      expiresInMinutes: z.number().optional(), // For ephemeral messages
      attachments: z.array(z.object({
        url: z.string(),
        fileName: z.string(),
        type: z.enum(['image', 'voice', 'video', 'document']),
        fileSize: z.number().optional(),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      const userId = ctx.session?.userId;
      if (!userId) throw new Error('Unauthorized');

      const expiresAt = input.expiresInMinutes 
        ? new Date(Date.now() + input.expiresInMinutes * 60000) 
        : null;

      const message = await ctx.db!.userChatMessage.create({
        data: {
          content: input.content,
          senderId: userId,
          groupId: input.groupId,
          expiresAt,
          attachments: input.attachments ? {
            create: input.attachments
          } : undefined
        },
        include: { attachments: true, sender: { select: { firstName: true, lastName: true } } }
      });

      // Broadcast to Realtime Hub
      if (ctx.tenantSlug) {
        realtimeHub.broadcast(
          ctx.tenantSlug,
          'CHAT_MESSAGE_RECEIVED',
          'InternalGroup',
          input.groupId,
          {
            messageId: message.id,
            content: message.content,
            sender: `${message.sender.firstName} ${message.sender.lastName}`,
            expiresAt: message.expiresAt
          }
        );
      }

      // Update Group's lastMessageAt
      await ctx.db!.chatGroup.update({
        where: { id: input.groupId },
        data: { lastMessageAt: new Date() }
      });

      return message;
    }),

  /**
   * createGroup
   * Initializes a new clinical collaboration group or resolves a 1:1 DM.
   */
  createGroup: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      type: z.enum(['DIRECT', 'GROUP', 'SYSTEM']).default('GROUP'),
      participantIds: z.array(z.string()), // For 1:1, pass the other user's ID
    }))
    .mutation(async ({ ctx, input }: any) => {
      const myId = ctx.session?.userId;
      if (!myId) throw new Error('Unauthorized');

      const allParticipants = Array.from(new Set([...input.participantIds, myId]));

      // If direct, try to find existing DM group
      if (input.type === 'DIRECT' && allParticipants.length === 2) {
        const existing = await ctx.db!.chatGroup.findFirst({
            where: {
                type: 'DIRECT',
                members: { every: { userId: { in: allParticipants } } }
            }
        });
        if (existing) return existing;
      }

      return ctx.db!.chatGroup.create({
        data: {
          name: input.name,
          type: input.type,
          members: {
            create: allParticipants.map((userId: any) => ({
              userId,
              role: userId === myId ? 'ADMIN' : 'MEMBER'
            }))
          }
        }
      });
    }),
});
