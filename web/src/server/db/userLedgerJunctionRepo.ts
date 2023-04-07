import { UserLedgerJunctionRepo } from "@marble/db";
import { mongoClient } from "./client";

export const userLedgerJunctionRepo = new UserLedgerJunctionRepo(mongoClient);
