import { LedgerEntryRepo } from "@marble/db";
import { mongoClient } from "./client";

export const ledgerEntryRepo = new LedgerEntryRepo(mongoClient);
