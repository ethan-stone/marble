import { createTRPCRouter } from "@/server/api/trpc";
import { ledgersRouter } from "@/server/api/routers/ledgers";
import { ledgerEntryRouter } from "@/server/api/routers/ledgerEntry";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  ledgers: ledgersRouter,
  ledgerEntries: ledgerEntryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
