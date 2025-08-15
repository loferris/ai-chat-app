import { z } from 'zod';
import { router, publicProcedure } from '../../server/trpc';

export const conversationsRouter = router({
  list: publicProcedure.query(async () => {
    // Fetch conversations from database
    // ... your Prisma logic here
    return [];
  }),

  create: publicProcedure.mutation(async () => {
    // Create new conversation in database
    // ... your Prisma logic here
    return { id: 'new-id', title: 'New Conversation' };
  }),

  delete: publicProcedure.input(z.string()).mutation(async ({ input: _conversationId }) => {
    // Delete conversation from database
    // ... your Prisma logic here
    return { success: true };
  }),
});
