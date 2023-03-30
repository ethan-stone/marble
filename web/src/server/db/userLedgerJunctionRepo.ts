import { UserLedgerJunctionRepo } from "@marble/db";
import { prisma } from "./client";

export const userLedgerJunctionRepo = new UserLedgerJunctionRepo(prisma);
