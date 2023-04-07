import { Collection, MongoClient } from "mongodb";
import { Overwrite } from "./utils/helpers";
import { uid } from "./utils/uid";

export type UserLedgerJunction = {
  ledgerId: string;
  userId: string;
};

export type DbUserLedgerJunction = Overwrite<
  UserLedgerJunction,
  {
    _id: string;
  }
>;

export interface IUserLedgerJunctionRepo {
  insert(args: {
    userId: string;
    ledgerId: string;
  }): Promise<UserLedgerJunction>;
}

export class UserLedgerJunctionRepo implements IUserLedgerJunctionRepo {
  private coll: Collection<DbUserLedgerJunction>;

  constructor(private db: MongoClient) {
    this.coll = this.db
      .db()
      .collection<DbUserLedgerJunction>("userLedgerJunction");
  }

  private getUid(): string {
    return uid();
  }

  async insert(args: {
    userId: string;
    ledgerId: string;
  }): Promise<UserLedgerJunction> {
    await this.coll.insertOne({
      _id: this.getUid(),
      userId: args.userId,
      ledgerId: args.ledgerId,
    });

    const res = await this.coll.findOne({
      userId: args.userId,
      ledgerId: args.ledgerId,
    });

    if (!res)
      throw new Error(
        `Could not find userLedgerJunction with userId: ${args.userId} and ledgerId: ${args.ledgerId} after inserting. This should never happen`
      );

    return {
      ledgerId: res.ledgerId,
      userId: res.userId,
    };
  }
}
