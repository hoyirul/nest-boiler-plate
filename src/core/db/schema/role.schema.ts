import { pgTable, bigserial, integer, varchar, timestamp } from "drizzle-orm/pg-core";

export const roles = pgTable("roles", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  guard_name: varchar("guard_name", { length: 100 }).default("web"),
  level: integer("level").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  deleted_at: timestamp("deleted_at", { withTimezone: false }).default(null as unknown as Date),
});
