import { z } from 'zod';
import { router, publicProcedure } from '../../server/trpc';
import { getAssistantResponse } from '../services/assistant';

export const chatRouter = router({
  sendMessage: publicProcedure
    .input(
      z.object({
        content: z.string(),
        conversationId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { content, _conversationId } = input;

      // Get response from assistant service
      const response = await getAssistantResponse(content);

      // Save message to database
      // ... your Prisma logic here

      return {
        id: 'message-id',
        content: response,
        role: 'assistant' as const,
        timestamp: new Date(),
      };
    }),
});
