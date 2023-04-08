import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { newLedger } from "@/server/api/useCases/new-ledger";
import { listLedgers } from "@/server/api/useCases/list-ledgers";
import { getLedger } from "@/server/api/useCases/get-ledger";
import { ledgerRepo } from "@/server/db/ledgerRepo";

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
          ledgerRepo,
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
      return listLedgers(
        {
          userId: ctx.auth.userId,
          limit: input.limit,
          startingAfter: input.cursor,
        },
        {
          ledgerRepo,
        }
      );
    }),

  getLedger: protectedProcedure
    .input(
      z.object({
        ledgerId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      return getLedger(
        {
          ledgerId: input.ledgerId,
          userId: ctx.auth.userId,
        },
        {
          ledgerRepo,
        }
      );
    }),
});
