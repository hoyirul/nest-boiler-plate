import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
} from "drizzle-orm/pg-core";

export const examples = pgTable("examples", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  attachment: text("attachment").notNull(),
  created_at: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  deleted_at: timestamp("deleted_at", { withTimezone: false }).default(null as unknown as Date),
});
