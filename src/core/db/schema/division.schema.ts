/*
 * Copyright (c) 2026 Madhai
 * src/core/db/schema/division.schema.ts
 */

import { pgTable, bigserial, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const divisions = pgTable("mst_divisions", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }).default(null as unknown as string),
  created_at: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: false }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: false }).default(null as unknown as Date),
});
