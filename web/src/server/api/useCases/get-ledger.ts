import { type ILedgerRepo } from "@marble/db";

type Args = {
  ledgerId: string;
  userId: string;
};

type Ctx = {
  ledgerRepo: ILedgerRepo;
};

export class LedgerNotFoundError extends Error {
  constructor(id: string) {
    super(`Ledger with id ${id} not found`);
  }
}

export async function getLedger(args: Args, ctx: Ctx) {
  const ledger = await ctx.ledgerRepo.getByUser(args);

  if (!ledger) throw new LedgerNotFoundError(args.ledgerId);

  return ledger;
}
