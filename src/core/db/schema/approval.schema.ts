/*
 * Copyright (c) 2026 Madhai
 * src/core/db/schema/approval.schema.ts
 */

import { pgTable, bigserial, varchar, integer, bigint, timestamp } from "drizzle-orm/pg-core";
import { actions } from "./action.schema";

export const approvals = pgTable("trx_approvals", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  model_type: varchar("model_type", { length: 100 }).notNull(),
  approver_id: varchar("approver_id", { length: 36 }).notNull(),
  step: integer("step").notNull(),
  action_id: bigint("action_id", { mode: "number" }).notNull().references(() => actions.id, { onDelete: "cascade" }),
  remarks: varchar("remarks", { length: 255 }).default(null as unknown as string),
  created_at: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: false }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: false }).default(null as unknown as Date),
});
