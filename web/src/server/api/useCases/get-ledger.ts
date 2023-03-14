import { getLedgerByUser } from "@/server/db/ledger";

type Args = {
  ledgerId: string;
  userId: string;
};

export class LedgerNotFoundError extends Error {
  constructor(id: string) {
    super(`Ledger with id ${id} not found`);
  }
}

export async function getLedger(args: Args) {
  const ledger = await getLedgerByUser(args);

  if (!ledger) throw new LedgerNotFoundError(args.ledgerId);

  return ledger;
}
