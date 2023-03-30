import { UserLedgerJunction, PrismaClient } from "@prisma/client";

export interface IUserLedgerJunctionRepo {
  insert(args: {
    userId: string;
    ledgerId: string;
  }): Promise<UserLedgerJunction>;
}

export class UserLedgerJunctionRepo implements IUserLedgerJunctionRepo {
  constructor(private db: PrismaClient) {}

  async insert(args: {
    userId: string;
    ledgerId: string;
  }): Promise<UserLedgerJunction> {
    return this.db.userLedgerJunction.create({
      data: args,
    });
  }
}
