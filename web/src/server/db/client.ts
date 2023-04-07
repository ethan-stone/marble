import { env } from "@/env.mjs";
import { MongoClient } from "@marble/db";

export const mongoClient = new MongoClient(env.DATABASE_URL);
