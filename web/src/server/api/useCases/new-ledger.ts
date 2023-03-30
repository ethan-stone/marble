import { type ILedgerRepo, type IUserLedgerJunctionRepo } from "@marble/db";

type Args = {
  userId: string;
  name: string;
};

type Ctx = {
  ledgerRepo: ILedgerRepo;
  userLedgerJunctionRepo: IUserLedgerJunctionRepo;
};

export async function newLedger(args: Args, ctx: Ctx) {
  const now = new Date();

  const ledger = await ctx.ledgerRepo.insert({
    name: args.name,
    ownerId: args.userId,
    createdAt: now,
    updatedAt: now,
  });

  await ctx.userLedgerJunctionRepo.insert({
    ledgerId: ledger.id,
    userId: args.userId,
  });

  return ledger;
}
