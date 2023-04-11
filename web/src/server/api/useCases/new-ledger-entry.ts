import {
  type LedgerEntry,
  type ILedgerEntryRepo,
  type ILedgerRepo,
} from "@marble/db";
import { z } from "zod";

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

const amountSchema = z.number().int().positive();

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
  if (args.kind === "oneTime") {
    if (!args.oneTime) {
      throw new ValidationError(
        "Must provide amount if entry kind is One Time"
      );
    }

    const errors: string[] = [];

    const parsedAmount = await amountSchema.spa(args.oneTime.amount);

    if (!parsedAmount.success) {
      errors.push("Amount must be a positive integer");
    }

    if (errors.length > 0) throw new ValidationError(errors.join(", "));

    const now = new Date();

    return ctx.ledgerEntryRepo.insert({
      ...args,
      recurring: undefined,
      createdAt: now,
      updatedAt: now,
    });
  }

  if (args.kind === "recurring") {
    if (!args.recurring) {
      throw new ValidationError(
        "Must provide amount, frequency, and start date if entry kind is Recurring"
      );
    }

    const errors: string[] = [];

    const parsedAmount = await amountSchema.spa(args.recurring.amount);

    if (!parsedAmount.success) {
      errors.push("Amount must be a positive integer");
    }

    if (args.recurring.startAt < new Date()) {
      errors.push("Start date must be in the future");
    }

    if (errors.length > 0) throw new ValidationError(errors.join(", "));

    const now = new Date();

    return ctx.ledgerEntryRepo.insert({
      ...args,
      oneTime: undefined,
      createdAt: now,
      updatedAt: now,
    });
  }

  throw new ValidationError("Invalid entry kind");
}
