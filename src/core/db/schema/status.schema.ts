/*
 * Copyright (c) 2026 Madhai
 * src/core/db/schema/status.schema.ts
 */

import { pgTable, bigserial, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const statuses = pgTable("mst_statuses", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  code: varchar("code", { length: 50 }).notNull(),
  label: varchar("label", { length: 100 }).notNull(),
  sort_order: integer("sort_order").notNull(),
  created_at: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: false }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: false }).default(null as unknown as Date),
});
