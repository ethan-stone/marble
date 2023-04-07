import { Collection, Filter, MongoClient } from "mongodb";
import { uid } from "./utils/uid";
import { Overwrite } from "./utils/helpers";

export type Ledger = {
  id: string;
  ownerId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type DbLedger = Omit<
  Overwrite<
    Ledger,
    {
      _id: string;
    }
  >,
  "id"
>;

export interface ILedgerRepo {
  insert(ledger: Omit<Ledger, "id">): Promise<Ledger>;
  listByUser(args: {
    userId: string;
    limit: number;
    startingAfter?: string;
  }): Promise<{
    hasMore: boolean;
    items: Ledger[];
  }>;
  getByUser(args: { userId: string; ledgerId: string }): Promise<Ledger | null>;
}

export class LedgerRepo implements ILedgerRepo {
  private coll: Collection<DbLedger>;

  constructor(private db: MongoClient) {
    this.coll = this.db.db().collection<DbLedger>("ledger");
  }

  private getUid(): string {
    return uid({ prefix: "le" });
  }

  private fromDbToDomain(dbLedger: DbLedger): Ledger {
    return {
      id: dbLedger._id,
      ownerId: dbLedger.ownerId,
      name: dbLedger.name,
      createdAt: dbLedger.createdAt,
      updatedAt: dbLedger.updatedAt,
    };
  }

  private fromDomainToDb(ledger: Ledger): DbLedger {
    return {
      _id: ledger.id,
      ownerId: ledger.ownerId,
      name: ledger.name,
      createdAt: ledger.createdAt,
      updatedAt: ledger.updatedAt,
    };
  }

  async insert(ledger: Omit<Ledger, "id">): Promise<Ledger> {
    const _id = this.getUid();

    await this.coll.insertOne({
      _id,
      ...ledger,
    });

    const res = await this.coll.findOne({
      _id,
    });

    if (!res)
      throw new Error(
        `Could not find ledger with id: ${_id} after inserting. This should never happen`
      );

    return this.fromDbToDomain(res);
  }

  async listByUser(args: {
    userId: string;
    limit: number;
    startingAfter?: string;
  }): Promise<{
    hasMore: boolean;
    items: Ledger[];
  }> {
    if (args.startingAfter) {
      const startingAfterItem = await this.coll.findOne({
        _id: args.startingAfter,
      });

      if (!startingAfterItem)
        throw new Error(
          `Could not find startingAfter item with id: ${args.startingAfter}`
        );

      return {
        hasMore: false,
        items: [],
      };
    }

    return {
      hasMore: false,
      items: [],
    };
  }

  async getByUser(args: {
    userId: string;
    ledgerId: string;
  }): Promise<Ledger | null> {
    return null;
  }
}
