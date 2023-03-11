import { mysqlTable, text, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const ledger = mysqlTable("ledgers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name"),
});

export const userLedgerJunction = mysqlTable(
  "userLedgerJunction",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    ledgerId: varchar("ledgerId", { length: 36 }),
    userId: varchar("userId", { length: 36 }),
  },
  (userLedgerJunction) => ({
    userIdLedgerIdIdx: uniqueIndex("userId_ledgerId_idx").on(
      userLedgerJunction.userId,
      userLedgerJunction.ledgerId
    ),
  })
);
