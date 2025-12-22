import { pgTable, bigserial, varchar, timestamp } from "drizzle-orm/pg-core";

export const permissions = pgTable("permissions", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  guard_name: varchar("guard_name", { length: 100 }).default("web"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
