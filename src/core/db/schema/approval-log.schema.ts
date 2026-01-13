/*
 * Copyright (c) 2026 Madhai
 * src/core/db/schema/approval.schema.ts
 */

import { pgTable, bigserial, varchar, bigint, timestamp } from "drizzle-orm/pg-core";
import { statuses } from "./status.schema";
import { approvals } from "./approval.schema";

export const approvalLogs = pgTable("trx_approval_logs", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  approval_id: bigint("approval_id", { mode: "number" }).notNull().references(() => approvals.id, { onDelete: "cascade" }),
  model_type: varchar("model_type", { length: 100 }).notNull(),
  model_id: varchar("model_id", { length: 36 }).notNull(),
  status_from: bigint("status_from", { mode: "number" }).notNull().references(() => statuses.id, { onDelete: "cascade" }),
  status_to: bigint("status_to", { mode: "number" }).notNull().references(() => statuses.id, { onDelete: "cascade" }),
  action: bigint("action", { mode: "number" }).notNull().references(() => statuses.id, { onDelete: "cascade" }),
  changed_by: varchar("changed_by", { length: 36 }).notNull(),
  note: varchar("note", { length: 255 }).default(null as unknown as string),
  created_at: timestamp("created_at", { withTimezone: false }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: false }).defaultNow().notNull()
});
