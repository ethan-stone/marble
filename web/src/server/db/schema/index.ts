import {
  type InferModel,
  mysqlTable,
  text,
  varchar,
  primaryKey,
  datetime,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

export const ledgers = mysqlTable("ledgers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  ownerId: varchar("ownerId", { length: 36 }).notNull(),
  name: text("name").notNull(),
  createdAt: datetime("createdAt", { mode: "string", fsp: 3 }).notNull(),
  updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 }).notNull(),
});

export type Ledger = InferModel<typeof ledgers>;
export type NewLedger = InferModel<typeof ledgers, "insert">;

export const journals = mysqlTable("journals", {
  id: varchar("id", { length: 36 }).primaryKey(),
  creatorId: varchar("creatorId", { length: 36 }).notNull(),
  name: text("name").notNull(),
  createdAt: datetime("createdAt", { mode: "string", fsp: 3 }).notNull(),
  updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 }).notNull(),
});

export const accounts = mysqlTable("accounts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  type: mysqlEnum("type", ["3rdParty", "user"]),
});

export const userLedgerJunction = mysqlTable(
  "userLedgerJunction",
  {
    ledgerId: varchar("ledgerId", { length: 36 }).notNull(),
    userId: varchar("userId", { length: 36 }).notNull(),
  },
  (userLedgerJunction) => {
    return {
      userIdLedgerIdCPK: primaryKey(
        userLedgerJunction.userId,
        userLedgerJunction.ledgerId
      ),
    };
  }
);

export type UserLedgerJunction = InferModel<typeof userLedgerJunction>;
