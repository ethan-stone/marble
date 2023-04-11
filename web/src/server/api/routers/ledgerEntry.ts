import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import {
  newLedgerEntry,
  ValidationError,
  LedgerNotFoundError,
} from "@/server/api/useCases/new-ledger-entry";
import { ledgerRepo } from "@/server/db/ledgerRepo";
import { ledgerEntryRepo } from "@/server/db/ledgerEntryRepo";
import { TRPCError } from "@trpc/server";

export const ledgerEntryRouter = createTRPCRouter({
  newLedgerEntry: protectedProcedure
    .input(
      z.object({
        ledgerId: z.string(),
        name: z.string(),
        purchaserId: z.string(),
        kind: z.enum(["oneTime", "recurring"]),
        oneTime: z
          .object({
            amount: z.number().int().positive(),
          })
          .optional(),
        recurring: z
          .object({
            amount: z.number().int().positive(),
            frequency: z.enum(["monthly", "annually", "daily"]),
            startAt: z.string().datetime(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        return newLedgerEntry(
          {
            ...input,
            recurring: input.recurring
              ? {
                  ...input.recurring,
                  startAt: new Date(input.recurring.startAt),
                }
              : undefined,
            creatorId: ctx.auth.userId,
          },
          {
            ledgerRepo: ledgerRepo,
            ledgerEntryRepo: ledgerEntryRepo,
          }
        );
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        } else if (error instanceof LedgerNotFoundError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: error.message,
          });
        } else {
          throw error;
        }
      }
    }),
});
