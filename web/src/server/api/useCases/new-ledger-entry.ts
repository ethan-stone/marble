import {
  type LedgerEntry,
  type ILedgerEntryRepo,
  type ILedgerRepo,
} from "@marble/db";

type Args = {
  ledgerId: string;
  name: string;
  creatorId: string;
  purchaserId: string;
  kind: "oneTime" | "recurring";
  oneTime?: {
    amount: number;
  };
  recurring?: {
    amount: number;
    frequency: "monthly" | "annually" | "daily";
    startAt: Date;
  };
};

type Ctx = {
  ledgerRepo: ILedgerRepo;
  ledgerEntryRepo: ILedgerEntryRepo;
};

export class LedgerNotFoundError extends Error {
  public code = "LEDGER_NOT_FOUND";

  constructor(msg: string) {
    super(msg);
  }
}

export class ValidationError extends Error {
  public code = "VALIDATION_ERROR";

  constructor(msg: string) {
    super(msg);
  }
}

export async function newLedgerEntry(
  args: Args,
  ctx: Ctx
): Promise<LedgerEntry> {
  // check that the creator has access to this ledger
  const ledger = await ctx.ledgerRepo.getByUser({
    ledgerId: args.ledgerId,
    userId: args.creatorId,
  });

  if (!ledger)
    throw new LedgerNotFoundError("Could not find the specified ledger");

  // validate that based on ledger entry kind the correct data is provided
  if (args.kind === "oneTime" && !("oneTime" in args)) {
    throw new ValidationError("Must provide amount if entry kind is One Time");
  }

  if (args.kind === "recurring" && !("recurring" in args)) {
    throw new ValidationError(
      "Must provide amount, frequency, and start date if entry kind is Recurring"
    );
  }

  const now = new Date();

  const ledgerEntry = await ctx.ledgerEntryRepo.insert({
    ...args,
    createdAt: now,
    updatedAt: now,
  });

  return ledgerEntry;
}
