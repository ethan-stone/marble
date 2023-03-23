import { db } from "@/server/db/client";
import {
  ledger,
  type NewLedger,
  type Ledger,
  userLedgerJunction,
} from "@/server/db/schema";
import { and, asc, desc, eq, gt, lt, or } from "drizzle-orm/expressions";
import { uid } from "@/utils/uid";

export type InsertLedgerFn = (args: Omit<NewLedger, "id">) => Promise<Ledger>;

export const insertLedger: InsertLedgerFn = async (args) => {
  const id = uid();

  await db.insert(ledger).values({
    ...args,
    id,
  });

  const newLedger = (
    await db.select().from(ledger).where(eq(ledger.id, id))
  )[0];

  if (!newLedger)
    throw new Error(`Unexpected error retrieving inserted ledger`);

  return newLedger;
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
      await db.select().from(ledger).where(eq(ledger.id, args.startingAfter))
    )[0];

    if (!startingAfterItem)
      throw new Error(
        `Could not find startingAfter item with id: ${args.startingAfter}`
      );

    const results = await db
      .select()
      .from(userLedgerJunction)
      .leftJoin(ledger, eq(userLedgerJunction.ledgerId, ledger.id))
      .where(
        and(
          eq(userLedgerJunction.userId, args.userId),
          or(
            lt(ledger.updatedAt, startingAfterItem.updatedAt),
            and(
              eq(ledger.updatedAt, startingAfterItem.updatedAt),
              gt(ledger.id, startingAfterItem.id)
            )
          )
        )
      )
      .orderBy(desc(ledger.updatedAt), asc(ledger.id))
      .limit(args.limit + 1);

    const items = results.length > args.limit ? results.slice(0, -1) : results;

    return {
      hasMore: results.length > args.limit,
      items: items
        .map((i) => i.ledger)
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
    .leftJoin(ledger, eq(userLedgerJunction.ledgerId, ledger.id))
    .where(eq(userLedgerJunction.userId, args.userId))
    .orderBy(desc(ledger.updatedAt), asc(ledger.id))
    .limit(args.limit + 1);

  const items = results.length > args.limit ? results.slice(0, -1) : results;

  return {
    hasMore: results.length > args.limit,
    items: items
      .map((i) => i.ledger)
      .filter((i) => {
        if (i === null)
          console.warn(
            `Found user ledger junction with no matching ledger in ledgers table`
          );
        return i !== null;
      }) as Ledger[],
  };
};

export type GetLedgerByUser = (args: {
  userId: string;
  ledgerId: string;
}) => Promise<Ledger | null>;

export const getLedgerByUser: GetLedgerByUser = async (args) => {
  const result = (
    await db
      .select()
      .from(userLedgerJunction)
      .leftJoin(ledger, eq(userLedgerJunction.ledgerId, ledger.id))
      .where(
        and(
          eq(userLedgerJunction.userId, args.userId),
          eq(userLedgerJunction.ledgerId, args.ledgerId)
        )
      )
  )[0];

  if (!result?.ledger) return null;

  return result.ledger;
};
