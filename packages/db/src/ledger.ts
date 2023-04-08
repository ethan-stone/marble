import { Collection, Filter, MongoClient } from "mongodb";
import { Overwrite } from "./utils/helpers";
import { DbUserLedgerJunction } from "./userLedgerJunction";
import { uid } from "./utils/uid";

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
  private ledger: Collection<DbLedger>;
  private userLedgerJunction: Collection<DbUserLedgerJunction>;
  private getUID: (args?: { prefix: string }) => string;

  constructor(private client: MongoClient) {
    this.ledger = this.client.db().collection<DbLedger>("ledger");
    this.userLedgerJunction = this.client
      .db()
      .collection<DbUserLedgerJunction>("userLedgerJunction");
    this.getUID = uid;
  }

  private getLedgerUID(): string {
    return this.getUID({ prefix: "le" });
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
    const session = this.client.startSession();

    const _id = this.getLedgerUID();

    await session.withTransaction(
      async () => {
        await this.ledger.insertOne(
          {
            _id,
            ...ledger,
          },
          { session }
        );

        await this.userLedgerJunction.insertOne(
          {
            _id: this.getUID(),
            userId: ledger.ownerId,
            ledgerId: _id,
          },
          { session }
        );
      },
      {
        readPreference: "primary",
        readConcern: { level: "local" },
        writeConcern: { w: "majority" },
      }
    );

    return this.fromDbToDomain({
      _id,
      ...ledger,
    });
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
      const startingAfterItem = await this.ledger.findOne({
        _id: args.startingAfter,
      });

      if (!startingAfterItem)
        throw new Error(
          `Could not find startingAfter item with id: ${args.startingAfter}`
        );

      const cursor = this.userLedgerJunction.aggregate<
        DbUserLedgerJunction & {
          ledger: DbLedger;
        }
      >([
        {
          $lookup: {
            from: "ledger",
            localField: "ledgerId",
            foreignField: "_id",
            as: "ledger",
          },
        },
        {
          $addFields: {
            ledger: {
              $first: "$ledger",
            },
          },
        },
        {
          $match: {
            $and: [
              {
                userId: args.userId,
              },
              {
                $or: [
                  {
                    "ledger.updatedAt": {
                      $lt: startingAfterItem.updatedAt,
                    },
                  },
                  {
                    $and: [
                      {
                        "ledger.updatedAt": startingAfterItem.updatedAt,
                      },
                      {
                        "ledger._id": {
                          $gt: startingAfterItem._id,
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
        {
          $sort: {
            "ledger.updatedAt": -1,
            "ledger._id": 1,
          },
        },
        {
          $limit: args.limit + 1,
        },
      ]);

      const results = await cursor.toArray();

      const items =
        results.length > args.limit ? results.slice(0, -1) : results;

      return {
        hasMore: results.length > args.limit,
        items: items.map((i) => this.fromDbToDomain(i.ledger)),
      };
    }

    const cursor = this.userLedgerJunction.aggregate<
      DbUserLedgerJunction & {
        ledger: DbLedger;
      }
    >([
      {
        $lookup: {
          from: "ledger",
          localField: "ledgerId",
          foreignField: "_id",
          as: "ledger",
        },
      },
      {
        $addFields: {
          ledger: {
            $first: "$ledger",
          },
        },
      },
      {
        $sort: {
          "ledger.updatedAt": -1,
          "ledger._id": 1,
        },
      },
      {
        $limit: args.limit + 1,
      },
    ]);

    const results = await cursor.toArray();

    const items = results.length > args.limit ? results.slice(0, -1) : results;

    return {
      hasMore: results.length > args.limit,
      items: items.map((i) => this.fromDbToDomain(i.ledger)),
    };
  }

  async getByUser(args: {
    userId: string;
    ledgerId: string;
  }): Promise<Ledger | null> {
    const cursor = this.userLedgerJunction.aggregate<
      DbUserLedgerJunction & {
        ledger: DbLedger;
      }
    >([
      {
        $lookup: {
          from: "ledger",
          localField: "ledgerId",
          foreignField: "_id",
          as: "ledger",
        },
      },
      {
        $addFields: {
          ledger: {
            $first: "$ledger",
          },
        },
      },
      {
        $match: {
          ledgerId: args.ledgerId,
          userId: args.userId,
        },
      },
    ]);

    // only return the first result because userId and ledgerId are unique
    const result = (await cursor.toArray())[0];

    return result?.ledger ? this.fromDbToDomain(result.ledger) : null;
  }
}
