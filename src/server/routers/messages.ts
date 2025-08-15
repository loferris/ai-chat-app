// src/server/routers/messages.ts
import { z } from 'zod';
import { router, publicProcedure } from '../../server/trpc'; // Use 'router' instead

export const messagesRouter = router({
  // Use 'router' instead of 'createTRPCRouter'
  // Add message to conversation
  create: publicProcedure
    .input(
      z.object({
        conversationId: z.string(),
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
        tokens: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Update conversation's updatedAt timestamp
      await ctx.db.conversation.update({
        where: { id: input.conversationId },
        data: { updatedAt: new Date() },
      });

      return ctx.db.message.create({
        data: {
          conversationId: input.conversationId,
          role: input.role,
          content: input.content,
          tokens: input.tokens,
        },
      });
    }),

  // Get messages for conversation (alternative to including in conversation query)
  getByConversation: publicProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.message.findMany({
        where: { conversationId: input.conversationId },
        orderBy: { createdAt: 'asc' },
      });
    }),

  // Update message (for future editing features)
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.message.update({
        where: { id: input.id },
        data: { content: input.content },
      });
    }),

  // Delete message
  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    return ctx.db.message.delete({
      where: { id: input.id },
    });
  }),
});
