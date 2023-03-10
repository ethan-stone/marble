import { mysqlTable, text, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  fullName: text("full_name"),
  phone: varchar("phone", { length: 256 }),
});
