import { listLedgersByUser } from "@/server/db/ledger";

type Args = {
  userId: string;
  limit: number;
  startingAfter?: string;
};

export async function listLedgers(args: Args) {
  return listLedgersByUser(args);
}
