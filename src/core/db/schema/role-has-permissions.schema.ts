import {
  pgTable,
  bigint,
  primaryKey,
} from "drizzle-orm/pg-core";
import { roles } from "@/core/db/schema/role.schema";
import { permissions } from "@/core/db/schema/permission.schema";

export const roleHasPermissions = pgTable(
  "rel_role_has_permissions",
  {
    role_id: bigint("role_id", { mode: "number" })
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),

    permission_id: bigint("permission_id", { mode: "number" })
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({
      columns: [
        table.role_id,
        table.permission_id,
      ],
      name: "role_has_permissions_pk",
    }),
  })
);
