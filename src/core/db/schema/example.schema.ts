import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  bigint
} from "drizzle-orm/pg-core";
import { statuses } from "./status.schema";

export const examples = pgTable("examples", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  attachment: text("attachment").notNull(),
  status_id: bigint("status_id", { mode: "number" }).notNull().references(() => statuses.id, { onDelete: "cascade" }).default(1),
  created_at: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: false }).default(null as unknown as Date),
});
