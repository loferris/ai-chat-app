import { httpBatchLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import type { AppRouter } from '../../server/root';
import superjson from 'superjson';

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
          headers() {
            // Generate or get session ID from localStorage
            let sessionId = '';
            if (typeof window !== 'undefined') {
              sessionId = localStorage.getItem('session-id') || '';
              if (!sessionId) {
                sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem('session-id', sessionId);
              }
            }
            
            return {
              'x-session-id': sessionId,
            };
          },
        }),
      ],
    };
  },
  ssr: false,
  transformer: superjson,
});
