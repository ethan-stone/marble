import {
  type InferModel,
  mysqlTable,
  text,
  varchar,
  primaryKey,
  timestamp,
} from "drizzle-orm/mysql-core";

export const ledgers = mysqlTable("ledgers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  ownerId: varchar("ownerId", { length: 36 }).notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("createdAt", { fsp: 3 }).notNull(),
  updatedAt: timestamp("updatedAt", { fsp: 3 }).notNull(),
});

export type Ledger = InferModel<typeof ledgers>;
export type NewLedger = InferModel<typeof ledgers, "insert">;

export const userLedgerJunction = mysqlTable(
  "userLedgerJunction",
  {
    ledgerId: varchar("ledgerId", { length: 36 }).notNull(),
    userId: varchar("userId", { length: 36 }).notNull(),
  },
  (userLedgerJunction) => ({
    userIdLedgerIdCPK: primaryKey(
      userLedgerJunction.userId,
      userLedgerJunction.ledgerId
    ),
  })
);

export type UserLedgerJunction = InferModel<typeof userLedgerJunction>;
