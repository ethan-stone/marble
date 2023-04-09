import { Collection, MongoClient } from "mongodb";
import { Overwrite } from "./utils/helpers";
import { uid } from "./utils/uid";

export type LedgerEntry = {
  id: string;
  ledgerId: string;
  name: string;
  creatorId: string; // id of the user who made this entry
  purchaserId: string; // id of the user who made the purchase for this entry
  kind: "oneTime" | "recurring";
  oneTime?: {
    amount: number;
  };
  recurring?: {
    amount: number;
    frequency: "monthly" | "annually" | "daily";
    anchor: Date; // the date of the first time this recurring entry should be triggered
  };
  createdAt: Date;
  updatedAt: Date;
};

export type DbLedgerEntry = Omit<
  Overwrite<
    LedgerEntry,
    {
      _id: string;
    }
  >,
  "id"
>;

export interface ILedgerEntryRepo {
  insert(ledgerEntry: Omit<LedgerEntry, "id">): Promise<LedgerEntry>;
  listByLedger(args: {
    ledgerId: string;
    limit: number;
    startingAfter?: string;
  }): Promise<{
    hasMore: boolean;
    items: LedgerEntry[];
  }>;
}

export class LedgerEntryRepo implements ILedgerEntryRepo {
  private ledgerEntry: Collection<DbLedgerEntry>;
  private getUID: (args?: { prefix: string }) => string;

  constructor(private client: MongoClient) {
    this.ledgerEntry = this.client
      .db()
      .collection<DbLedgerEntry>("ledgerEntry");
    this.getUID = uid;
  }

  private getLedgerEntryUID(): string {
    return this.getUID({ prefix: "le" });
  }

  private fromDbToDomain(dbLedgerEntry: DbLedgerEntry): LedgerEntry {
    return {
      id: dbLedgerEntry._id,
      ledgerId: dbLedgerEntry.ledgerId,
      name: dbLedgerEntry.name,
      creatorId: dbLedgerEntry.creatorId,
      purchaserId: dbLedgerEntry.purchaserId,
      kind: dbLedgerEntry.kind,
      oneTime: dbLedgerEntry.oneTime,
      recurring: dbLedgerEntry.recurring,
      createdAt: dbLedgerEntry.createdAt,
      updatedAt: dbLedgerEntry.updatedAt,
    };
  }

  async insert(ledgerEntry: Omit<LedgerEntry, "id">): Promise<LedgerEntry> {
    const _id = this.getLedgerEntryUID();

    await this.ledgerEntry.insertOne({
      _id,
      ...ledgerEntry,
    });

    return this.fromDbToDomain({
      _id,
      ...ledgerEntry,
    });
  }
  async listByLedger(args: {
    ledgerId: string;
    limit: number;
    startingAfter?: string | undefined;
  }): Promise<{ hasMore: boolean; items: LedgerEntry[] }> {
    if (args.startingAfter) {
      const startingAfterItem = await this.ledgerEntry.findOne({
        _id: args.startingAfter,
      });

      if (!startingAfterItem)
        throw new Error(
          `Could not find startingAfter item with id: ${args.startingAfter}`
        );

      const cursor = this.ledgerEntry.find(
        {
          $and: [
            { ledgerId: args.ledgerId },
            {
              $or: [
                {
                  createdAt: {
                    $lt: startingAfterItem.createdAt,
                  },
                },
                {
                  $and: [
                    {
                      createdAt: startingAfterItem.createdAt,
                    },
                    {
                      _id: {
                        $gt: startingAfterItem._id,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          sort: {
            createdAt: -1,
            _id: 1,
          },
          limit: args.limit + 1,
        }
      );

      const results = await cursor.toArray();

      const items =
        results.length > args.limit ? results.slice(0, -1) : results;

      return {
        hasMore: results.length > args.limit,
        items: items.map((i) => this.fromDbToDomain(i)),
      };
    }

    const cursor = this.ledgerEntry.find(
      {
        ledgerId: args.ledgerId,
      },
      {
        sort: {
          createdAt: -1,
          _id: 1,
        },
        limit: args.limit + 1,
      }
    );

    const results = await cursor.toArray();

    const items = results.length > args.limit ? results.slice(0, -1) : results;

    return {
      hasMore: results.length > args.limit,
      items: items.map((i) => this.fromDbToDomain(i)),
    };
  }
}
