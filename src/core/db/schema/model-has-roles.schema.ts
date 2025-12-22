import {
  pgTable,
  bigint,
  varchar,
  primaryKey,
} from "drizzle-orm/pg-core";
import { roles } from "@/core/db/schema/role.schema";

export const modelHasRoles = pgTable(
  "model_has_roles",
  {
    role_id: bigint("role_id", { mode: "number" })
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),

    model_type: varchar("model_type", { length: 100 }).notNull(),
    model_id: varchar("model_id", { length: 36 }).notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [
        table.role_id,
        table.model_type,
        table.model_id,
      ],
      name: "model_has_roles_pk",
    }),
  })
);
