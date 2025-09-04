import { z } from 'zod';
import { router, publicProcedure } from '../../server/trpc';
import { createAssistant } from '../services/assistant';
import { TRPCError } from '@trpc/server';
import { validateConversationAccess } from '../utils/session';

export const chatRouter = router({
  sendMessage: publicProcedure
    .input(
      z.object({
        content: z.string()
          .min(1, 'Message content cannot be empty')
          .max(10000, 'Message content too long (max 10,000 characters)'),
        conversationId: z.string().min(1, 'Conversation ID is required'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { content, conversationId } = input;

        // Basic session validation
        if (!ctx.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Session required',
          });
        }

        // Validate conversation exists
        const conversation = await ctx.db.conversation.findUnique({
          where: { id: conversationId },
        });

        if (!conversation) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Conversation not found',
          });
        }

        // Basic conversation access validation
        if (!validateConversationAccess(conversation, ctx.user)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied',
          });
        }

        // Create assistant service
        const assistant = createAssistant({});

        // Get response from assistant service
        const result = await assistant.getResponse(content);

        // Handle different response types
        const response = typeof result === 'string' ? result : result.response;
        const model = typeof result === 'string' ? 'unknown' : result.model;
        const cost = typeof result === 'string' ? 0 : result.cost;

        if (!response || response.trim() === '') {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Assistant response is empty',
          });
        }

        // Use database transaction to ensure consistency
        const dbResult = await ctx.db.$transaction(async (tx) => {
          // Save user message to database
          const userMessage = await tx.message.create({
            data: {
              conversationId,
              role: 'user',
              content,
              tokens: Math.ceil(content.length / 4), // Rough token estimation
            },
          });

          // Check if this is the first message in the conversation
          const messageCount = await tx.message.count({
            where: { conversationId, role: 'user' },
          });

          // Auto-generate title from first user message
          if (messageCount === 1) {
            const title = content.trim().replace(/\n/g, ' ');
            const finalTitle = title.length <= 50 ? title : title.substring(0, 47) + '...';
            
            await tx.conversation.update({
              where: { id: conversationId },
              data: { 
                title: finalTitle,
                updatedAt: new Date() 
              },
            });
          } else {
            // Just update timestamp
            await tx.conversation.update({
              where: { id: conversationId },
              data: { updatedAt: new Date() },
            });
          }

          // Save assistant message to database
          const assistantMessage = await tx.message.create({
            data: {
              conversationId,
              role: 'assistant',
              content: response,
              tokens: Math.ceil(response.length / 4),
            },
          });

          return { userMessage, assistantMessage };
        });

        return {
          id: dbResult.assistantMessage.id,
          content: response,
          role: 'assistant' as const,
          timestamp: dbResult.assistantMessage.createdAt,
          model,
          cost,
        };
      } catch (error) {
        // If it's already a TRPC error, re-throw it
        if (error instanceof TRPCError) {
          throw error;
        }

        // Log the error for debugging
        console.error('Error in sendMessage:', error);

        // Return a generic error
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send message. Please try again.',
          cause: error,
        });
      }
    }),
});
