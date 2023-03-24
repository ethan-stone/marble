import { type InsertLedgerFn } from "@/server/db/ledger";
import { type InsertUserLedgerJunction } from "@/server/db/user-ledger-junction";

type Args = {
  userId: string;
  name: string;
};

type Ctx = {
  insertLedger: InsertLedgerFn;
  insertUserLedgerJunction: InsertUserLedgerJunction;
};

export async function newLedger(args: Args, ctx: Ctx) {
  const now = new Date();
  const ledger = await ctx.insertLedger({
    name: args.name,
    ownerId: args.userId,
    createdAt: now.getTime(),
    updatedAt: now.getTime(),
  });

  await ctx.insertUserLedgerJunction({
    ledgerId: ledger.id,
    userId: args.userId,
  });

  return ledger;
}
