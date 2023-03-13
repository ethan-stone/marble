import { createTRPCRouter } from "@/server/api/trpc";
import { ledgersRouter } from "@/server/api/routers/ledgers";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  ledgers: ledgersRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
