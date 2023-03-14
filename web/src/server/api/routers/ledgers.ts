import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { newLedger } from "@/server/api/useCases/new-ledger";
import { insertLedger } from "@/server/db/ledger";
import { insertUserLedgerJunction } from "@/server/db/user-ledger-junction";
import { listLedgers } from "@/server/api/useCases/list-ledgers";
import { getLedger } from "@/server/api/useCases/get-ledger";

export const ledgersRouter = createTRPCRouter({
  newLedger: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return newLedger(
        {
          name: input.name,
          userId: ctx.auth.userId,
        },
        {
          insertLedger,
          insertUserLedgerJunction,
        }
      );
    }),

  listLedgers: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(25),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      return listLedgers({
        userId: ctx.auth.userId,
        limit: input.limit,
        startingAfter: input.cursor,
      });
    }),

  getLedger: protectedProcedure
    .input(
      z.object({
        ledgerId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      return getLedger({
        ledgerId: input.ledgerId,
        userId: ctx.auth.userId,
      });
    }),
});
