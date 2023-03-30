import { Ledger, PrismaClient } from "@prisma/client";

export interface ILedgerRepo {
  insert(ledger: Ledger): Promise<Ledger>;
}

export class LedgerRepo implements ILedgerRepo {
  constructor(private db: PrismaClient) {}

  async insert(ledger: Ledger): Promise<Ledger> {
    return this.db.ledger.create({
      data: ledger,
    });
  }
}
