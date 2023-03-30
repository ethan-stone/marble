import { Ledger, PrismaClient } from "@prisma/client";

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
  constructor(private db: PrismaClient) {}

  async insert(ledger: Omit<Ledger, "id">): Promise<Ledger> {
    return this.db.ledger.create({
      data: ledger,
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
      const startingAfterItem = await this.db.ledger.findFirst({
        where: {
          id: args.startingAfter,
        },
      });

      if (!startingAfterItem)
        throw new Error(
          `Could not find startingAfter item with id: ${args.startingAfter}`
        );

      const results = await this.db.userLedgerJunction.findMany({
        include: {
          ledger: true,
        },
        where: {
          AND: [
            {
              userId: args.userId,
            },
            {
              OR: [
                {
                  ledger: {
                    updatedAt: {
                      lt: startingAfterItem.updatedAt,
                    },
                  },
                },
                {
                  AND: [
                    {
                      ledger: {
                        updatedAt: startingAfterItem.updatedAt,
                      },
                    },
                    {
                      ledger: {
                        id: {
                          gt: startingAfterItem.id,
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        orderBy: [
          {
            ledger: {
              updatedAt: "desc",
            },
          },
          {
            ledger: {
              id: "asc",
            },
          },
        ],
        take: args.limit + 1,
      });

      const items =
        results.length > args.limit ? results.slice(0, -1) : results;

      return {
        hasMore: results.length > args.limit,
        items: items.map((i) => i.ledger),
      };
    }

    const results = await this.db.userLedgerJunction.findMany({
      include: {
        ledger: true,
      },
      where: {
        userId: args.userId,
      },
      orderBy: [
        {
          ledger: {
            updatedAt: "desc",
          },
        },
        {
          ledger: {
            id: "asc",
          },
        },
      ],
      take: args.limit + 1,
    });

    const items = results.length > args.limit ? results.slice(0, -1) : results;

    return {
      hasMore: results.length > args.limit,
      items: items.map((i) => i.ledger),
    };
  }

  async getByUser(args: {
    userId: string;
    ledgerId: string;
  }): Promise<Ledger | null> {
    const result = await this.db.userLedgerJunction.findFirst({
      include: {
        ledger: true,
      },
      where: {
        AND: {
          userId: args.userId,
          ledgerId: args.ledgerId,
        },
      },
    });

    return result && result.ledger;
  }
}
