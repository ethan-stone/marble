import { type ILedgerRepo } from "@marble/db";

type Args = {
  userId: string;
  limit: number;
  startingAfter?: string;
};

type Ctx = {
  ledgerRepo: ILedgerRepo;
};

export async function listLedgers(args: Args, ctx: Ctx) {
  return ctx.ledgerRepo.listByUser(args);
}
