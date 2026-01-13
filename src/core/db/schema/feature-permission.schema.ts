/*
 * Copyright (c) 2026 Madhai
 * src/core/db/schema/feature_permission.schema.ts
 */

import { pgTable, bigint } from "drizzle-orm/pg-core";
import { features } from "./feature.schema";
import { permissions } from "./permission.schema";
import {  } from "drizzle-orm/pg-core";

export const featurePermissions = pgTable("rel_feature_permissions", {
  feature_id: bigint("feature_id", { mode: "number" }).notNull().references(() => features.id, { onDelete: "cascade" }),
  permission_id: bigint("permission_id", { mode: "number" }).notNull().references(() => permissions.id, { onDelete: "cascade" }),
});
