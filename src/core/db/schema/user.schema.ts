import {
  pgTable,
  varchar,
  timestamp,
  pgEnum,
  bigserial
} from "drizzle-orm/pg-core";
import { divisions } from "@/core/db/schema/division.schema";
import { departments } from "@/core/db/schema/department.schema";
import { positions } from "@/core/db/schema/position.schema";

export const statusEnum = pgEnum("status", [
  "active",
  "inactive",
  "banned",
]);

export const users = pgTable("mst_users", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  division_id: bigserial("division_id", { mode: "number" }).notNull().references(() => divisions.id, { onDelete: "cascade" }),
  department_id: bigserial("department_id", { mode: "number" }).notNull().references(() => departments.id, { onDelete: "cascade" }),
  position_id: bigserial("position_id", { mode: "number" }).notNull().references(() => positions.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  status: statusEnum("status").default("active").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
