import { drizzle } from "drizzle-orm/mysql2/index.js";
import { migrate } from "drizzle-orm/mysql2/migrator.js";
import mysql from "mysql2/promise.js";
import "dotenv/config";

const connection = mysql.createPool({
  host: process.env["DATABASE_HOST"],
  user: process.env["DATABASE_USERNAME"],
  password: process.env["DATABASE_PASSWORD"],
  multipleStatements: true,
  ssl: { rejectUnauthorized: true },
});

const db = drizzle(connection, {
  logger: true,
});

await migrate(db, { migrationsFolder: "./migrations" }).then(() =>
  process.exit()
);
