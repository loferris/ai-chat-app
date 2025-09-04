// src/server/routers/messages.ts
import { z } from 'zod';
import { router, publicProcedure } from '../../server/trpc';
import { TRPCError } from '@trpc/server';

export const messagesRouter = router({
  create: publicProcedure
    .input(
      z.object({
        conversationId: z.string().min(1, 'Conversation ID is required'),
        role: z.enum(['user', 'assistant']),
        content: z.string()
          .min(1, 'Message content cannot be empty')
          .max(10000, 'Message content too long (max 10,000 characters)'),
        tokens: z.number().min(0, 'Token count must be non-negative'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate conversation exists
        const conversation = await ctx.db.conversation.findUnique({
          where: { id: input.conversationId },
        });

        if (!conversation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Conversation not found',
          });
        }

        return await ctx.db.message.create({
          data: input,
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error('Error creating message:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create message',
          cause: error,
        });
      }
    }),

  getByConversation: publicProcedure
    .input(z.object({ conversationId: z.string().min(1, 'Conversation ID is required') }))
    .query(async ({ ctx, input }) => {
      try {
        // Validate conversation exists
        const conversation = await ctx.db.conversation.findUnique({
          where: { id: input.conversationId },
        });

        if (!conversation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Conversation not found',
          });
        }

        return await ctx.db.message.findMany({
          where: { conversationId: input.conversationId },
          orderBy: { createdAt: 'asc' },
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error('Error fetching messages:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch messages',
          cause: error,
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1, 'Message ID is required'),
        content: z.string()
          .min(1, 'Message content cannot be empty')
          .max(10000, 'Message content too long (max 10,000 characters)'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate message exists
        const message = await ctx.db.message.findUnique({
          where: { id: input.id },
        });

        if (!message) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Message not found',
          });
        }

        return await ctx.db.message.update({
          where: { id: input.id },
          data: { content: input.content },
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error('Error updating message:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update message',
          cause: error,
        });
      }
    }),

  delete: publicProcedure.input(z.string().min(1, 'Message ID is required')).mutation(async ({ ctx, input: messageId }) => {
    try {
      // Validate message exists
      const message = await ctx.db.message.findUnique({
        where: { id: messageId },
      });

      if (!message) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Message not found',
        });
      }

      await ctx.db.message.delete({
        where: { id: messageId },
      });

      return { success: true };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      console.error('Error deleting message:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to delete message',
        cause: error,
      });
    }
  }),
});
