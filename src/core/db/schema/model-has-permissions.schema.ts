import {
  pgTable,
  bigint,
  varchar,
  primaryKey,
} from "drizzle-orm/pg-core";
import { permissions } from "@/core/db/schema/permission.schema";

export const modelHasPermissions = pgTable(
  "model_has_permissions",
  {
    permission_id: bigint("permission_id", { mode: "number" })
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),

    model_type: varchar("model_type", { length: 100 }).notNull(),
    model_id: varchar("model_id", { length: 36 }).notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [
        table.permission_id,
        table.model_type,
        table.model_id,
      ],
      name: "model_has_permissions_pk",
    }),
  })
);
