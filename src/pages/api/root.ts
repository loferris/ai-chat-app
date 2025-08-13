import { createTRPCRouter } from '@/server/api/trpc';
import { conversationsRouter } from '@/server/api/routers/conversations';
import { messagesRouter } from '@/server/api/routers/messages';
import { chatRouter } from '@/server/api/routers/chat';
import { usageRouter } from '@/server/api/routers/usage';

export const appRouter = createTRPCRouter({
    conversations: conversationsRouter,
    messages: messagesRouter,
    chat: chatRouter,
    usage: usageRouter,
});

export type AppRouter = typeof appRouter;
