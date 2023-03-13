import {
  userLedgerJunction,
  type UserLedgerJunction,
} from "@/server/db/schema";
import { db } from "@/server/db/client";
import { and, eq } from "drizzle-orm/expressions";

export type InsertUserLedgerJunction = (args: {
  userId: string;
  ledgerId: string;
}) => Promise<UserLedgerJunction>;

export const insertUserLedgerJunction: InsertUserLedgerJunction = async (
  args
) => {
  await db.insert(userLedgerJunction).values(args);

  const junction = (
    await db
      .select()
      .from(userLedgerJunction)
      .where(
        and(
          eq(userLedgerJunction.userId, args.userId),
          eq(userLedgerJunction.ledgerId, args.ledgerId)
        )
      )
  )[0];

  if (!junction)
    throw new Error(`Unexpected error retrieving inserted userLedgerJunction`);

  return junction;
};
