import { db } from "@/server/db/client";
import {
  ledgers,
  type NewLedger,
  type Ledger,
  userLedgerJunction,
} from "@/server/db/schema";
import { and, asc, desc, eq, gt, lt, or } from "drizzle-orm/expressions";
import { uid } from "@/utils/uid";

export type InsertLedgerFn = (args: Omit<NewLedger, "id">) => Promise<Ledger>;

export const insertLedger: InsertLedgerFn = async (args) => {
  const id = uid();

  await db.insert(ledgers).values({
    ...args,
    id,
  });

  const ledger = (await db.select().from(ledgers).where(eq(ledgers.id, id)))[0];

  if (!ledger) throw new Error(`Unexpected error retrieving inserted ledger`);

  return ledger;
};

export type ListLedgersByUser = (args: {
  userId: string;
  limit: number;
  startingAfter?: string;
}) => Promise<{
  hasMore: boolean;
  items: Ledger[];
}>;

export const listLedgersByUser: ListLedgersByUser = async (args) => {
  if (args.startingAfter) {
    const startingAfterItem = (
      await db.select().from(ledgers).where(eq(ledgers.id, args.startingAfter))
    )[0];

    if (!startingAfterItem)
      throw new Error(
        `Could not find startingAfter item with id: ${args.startingAfter}`
      );

    const results = await db
      .select()
      .from(userLedgerJunction)
      .leftJoin(ledgers, eq(userLedgerJunction.ledgerId, ledgers.id))
      .where(lt(ledgers.updatedAt, startingAfterItem.updatedAt))
      .orderBy(desc(ledgers.updatedAt), asc(ledgers.id))
      .limit(args.limit + 1);

    const items = results.length > args.limit ? results.slice(0, -1) : results;

    return {
      hasMore: results.length > args.limit,
      items: items
        .map((i) => i.ledgers)
        .filter((i) => {
          if (i === null)
            console.warn(
              `Found user ledger junction with no matching ledger in ledgers table`
            );
          return i !== null;
        }) as Ledger[],
    };
  }

  const results = await db
    .select()
    .from(userLedgerJunction)
    .leftJoin(ledgers, eq(userLedgerJunction.ledgerId, ledgers.id))
    .orderBy(desc(ledgers.updatedAt), asc(ledgers.id))
    .limit(args.limit + 1);

  const items = results.length > args.limit ? results.slice(0, -1) : results;

  return {
    hasMore: results.length > args.limit,
    items: items
      .map((i) => i.ledgers)
      .filter((i) => {
        if (i === null)
          console.warn(
            `Found user ledger junction with no matching ledger in ledgers table`
          );
        return i !== null;
      }) as Ledger[],
  };
};
