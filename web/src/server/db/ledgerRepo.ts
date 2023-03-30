import { LedgerRepo } from "@marble/db";
import { prisma } from "./client";

export const ledgerRepo = new LedgerRepo(prisma);
