/*
 * Copyright (c) 2026 Madhai
 * src/core/db/schema/department.schema.ts
 */

import { pgTable, bigserial, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { divisions } from "@/core/db/schema/division.schema";

export const departments = pgTable("mst_departments", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  division_id: bigserial("division_id", { mode: "number" }).notNull().references(() => divisions.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: varchar("description", { length: 255 }).default(null as unknown as string),
  created_at: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: false }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: false }).default(null as unknown as Date),
});
