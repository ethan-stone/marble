import { LedgerRepo } from "@marble/db";
import { mongoClient } from "./client";
import { uid } from "@/utils/uid";

export const ledgerRepo = new LedgerRepo(mongoClient, uid);
