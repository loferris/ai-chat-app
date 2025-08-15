import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '../../../server/root';
import { createContext } from '../../../server/trpc';

export default createNextApiHandler({
  router: appRouter,
  createContext,
});

export const config = {
  api: {
    bodyParser: false,
  },
};
