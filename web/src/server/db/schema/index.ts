import {
  type InferModel,
  mysqlTable,
  text,
  varchar,
  primaryKey,
  datetime,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

/**
 * Ledgers are an abstract organization of accounts transactions
 */
export const ledgers = mysqlTable("ledgers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  ownerId: varchar("ownerId", { length: 36 }).notNull(),
  name: text("name").notNull(),
  createdAt: datetime("createdAt", { mode: "string", fsp: 3 }).notNull(),
  updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 }).notNull(),
});

export type Ledger = InferModel<typeof ledgers>;
export type NewLedger = InferModel<typeof ledgers, "insert">;

/**
 * Journals are a list of transactions between two or more accounts
 */
export const journals = mysqlTable("journals", {
  id: varchar("id", { length: 36 }).primaryKey(),
  ledgerId: varchar("ledgerId", { length: 36 }), // the ledger this journal is a part of
  name: text("name").notNull(),
  createdAt: datetime("createdAt", { mode: "string", fsp: 3 }).notNull(),
  updatedAt: datetime("updatedAt", { mode: "string", fsp: 3 }).notNull(),
});

/**
 * Accounts can be either a user or a 3rdparty. 3rdparty is any entity that is
 * not a user. For example if you cover someone for lunch at Five Guys and they
 * owe you their portion, you and the other person are users, and Five Guys is
 * the 3rdparty
 */
export const accounts = mysqlTable("accounts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  type: mysqlEnum("type", ["3rdparty", "user"]),
});

/**
 * users and ledgers is a many to many relationship so this is a jump table
 */
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
