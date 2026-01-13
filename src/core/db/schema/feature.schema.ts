/*
 * Copyright (c) 2026 Madhai
 * src/core/db/schema/feature.schema.ts
 */

import { pgTable, bigserial, bigint, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const features = pgTable("mst_features", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  parent_id: bigint("parent_id", { mode: "number" }).default(null as unknown as number),
  code: varchar("code", { length: 50 }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  route_path: varchar("route_path", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  sort_order: integer("sort_order").notNull(),
  is_active: boolean("is_active").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: false }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: false }).default(null as unknown as Date),
});
