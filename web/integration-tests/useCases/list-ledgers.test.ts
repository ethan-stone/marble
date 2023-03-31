import { listLedgers } from "@/server/api/useCases/list-ledgers";
import { newLedger } from "@/server/api/useCases/new-ledger";
import { uid } from "@/utils/uid";
import {
  type ILedgerRepo,
  type IUserLedgerJunctionRepo,
  LedgerRepo,
  PrismaClient,
  UserLedgerJunctionRepo,
  type Ledger,
} from "@marble/db";
import { describe, beforeEach, beforeAll, it, afterAll, expect } from "vitest";

interface Context {
  prisma: PrismaClient;
  ledgerRepo: ILedgerRepo;
  userLedgerJunctionRepo: IUserLedgerJunctionRepo;
  userId: string;
}

describe("list-ledgers use case", () => {
  const connectionString = `mysql://root@localhost:3306/marble`;
  const userId = uid();

  let prisma: PrismaClient;
  let ledgerRepo: ILedgerRepo;
  let userLedgerJunctionRepo: IUserLedgerJunctionRepo;

  beforeAll(() => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: connectionString,
        },
      },
    });

    ledgerRepo = new LedgerRepo(prisma);

    userLedgerJunctionRepo = new UserLedgerJunctionRepo(prisma);
  });

  beforeEach<Context>((ctx) => {
    ctx.prisma = prisma;
    ctx.ledgerRepo = ledgerRepo;
    ctx.userLedgerJunctionRepo = userLedgerJunctionRepo;
    ctx.userId = userId;
  });

  it<Context>("should successfully create 10 ledgers and 10 userLedgerJunctions and then list all of them", async (ctx) => {
    for (let i = 0; i < 10; i++) {
      const ledger = await newLedger(
        {
          name: "My Ledger",
          userId: ctx.userId,
        },
        {
          ledgerRepo: ctx.ledgerRepo,
          userLedgerJunctionRepo: ctx.userLedgerJunctionRepo,
        }
      );

      expect(ledger.ownerId).toBe(userId);
      expect(ledger.name).toBe("My Ledger");
    }

    let startingAfter: string | undefined = undefined;
    let ledgers: Ledger[] = [];

    while (true) {
      const results: {
        hasMore: boolean;
        items: Ledger[];
      } = await listLedgers(
        {
          startingAfter,
          limit: 5,
          userId: ctx.userId,
        },
        {
          ledgerRepo: ctx.ledgerRepo,
        }
      );

      ledgers = ledgers.concat(results.items);
      startingAfter = results.items[results.items.length - 1]?.id;

      if (!results.hasMore) break;
    }

    expect(ledgers.length).toBe(10);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
