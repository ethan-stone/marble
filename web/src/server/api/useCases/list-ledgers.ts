import { listLedgersByUser } from "@/server/db/ledger";

type Args = {
  userId: string;
  limit: number;
  startingAfter?: string;
};

export async function listLedgers(args: Args) {
  console.log(args);
  const ledgers = await listLedgersByUser(args);
  console.log(ledgers);
  return ledgers;
}
