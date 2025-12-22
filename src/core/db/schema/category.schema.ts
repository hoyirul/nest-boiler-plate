import {
  pgTable,
  serial,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});
