import { pgTable, bigserial, varchar, timestamp, text, bigint } from "drizzle-orm/pg-core";
// import { features } from "@/core/db/schema/feature.schema";

export const permissions = pgTable("mst_permissions", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  // feature_id: bigint("feature_id", { mode: "number" }).notNull().references(() => features.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description").default(null as unknown as string),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  deleted_at: timestamp("deleted_at", { withTimezone: false }).default(null as unknown as Date),
});
