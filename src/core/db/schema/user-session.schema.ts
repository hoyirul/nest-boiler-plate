import {
  pgTable,
  serial,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  user_id: varchar("user_id", { length: 36 }).notNull(),
  token: varchar("token", { length: 512 }).notNull(),
  refresh_token: varchar("refresh_token", { length: 512 }).notNull(),
  expired_at: timestamp("expired_at").notNull(),
  refresh_expired_at: timestamp("refresh_expired_at").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
