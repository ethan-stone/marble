import { LedgerRepo } from "@marble/db";
import { mongoClient } from "./client";

export const ledgerRepo = new LedgerRepo(mongoClient);
