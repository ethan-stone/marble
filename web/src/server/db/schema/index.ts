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
export const ledger = mysqlTable("ledger", {
  id: varchar("id", { length: 36 }).primaryKey(),
  ownerId: varchar("owner_id", { length: 36 }).notNull(),
  name: text("name").notNull(),
  createdAt: datetime("created_at", { mode: "string", fsp: 3 }).notNull(),
  updatedAt: datetime("updated_at", { mode: "string", fsp: 3 }).notNull(),
});

export type Ledger = InferModel<typeof ledger>;
export type NewLedger = InferModel<typeof ledger, "insert">;

/**
 * Journals are a list of transactions between two or more accounts
 */
export const journal = mysqlTable("journal", {
  id: varchar("id", { length: 36 }).primaryKey(),
  ledgerId: varchar("ledger_id", { length: 36 }), // the ledger this journal is a part of
  name: text("name").notNull(),
  createdAt: datetime("created_at", { mode: "string", fsp: 3 }).notNull(),
  updatedAt: datetime("updated_at", { mode: "string", fsp: 3 }).notNull(),
});

/**
 * Journal Entries are a specific entry in a journal
 */
export const journalEntry = mysqlTable("journal_entry", {
  id: varchar("id", { length: 36 }).primaryKey(),
  creatorId: varchar("creator_id", { length: 36 }),
  description: text("description").notNull(),
  createdAt: datetime("created_at", { mode: "string", fsp: 3 }).notNull(),
});

/**
 * Accounts can be either a user or a 3rdparty. 3rdparty is any entity that is
 * not a user. For example if you cover someone for lunch at Five Guys and they
 * owe you their portion, you and the other person are users, and Five Guys is
 * the 3rdparty
 */
export const account = mysqlTable("account", {
  id: varchar("id", { length: 36 }).primaryKey(),
  type: mysqlEnum("type", ["3rdparty", "user"]),
});

/**
 * users and ledgers is a many to many relationship so this is a jump table
 */
export const userLedgerJunction = mysqlTable(
  "user_ledger_junction",
  {
    ledgerId: varchar("ledger_id", { length: 36 }).notNull(),
    userId: varchar("user_id", { length: 36 }).notNull(),
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
