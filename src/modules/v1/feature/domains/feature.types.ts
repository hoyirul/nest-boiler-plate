/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/feature/domains/feature.types.ts
 */

import { z } from "zod";

export const CreateFeatureSchema = z.object({
  parent_id: z.number().optional(),
  code: z.string().min(1, "api.modules.feature.validation.code.required"),
  name: z.string().min(1, "api.modules.feature.validation.name.required"),
  route_path: z.string().min(1, "api.modules.feature.validation.route_path.required"),
  icon: z.string().min(1, "api.modules.feature.validation.icon.required"),
  sort_order: z.number().min(1, "api.modules.feature.validation.sort_order.required"),
  is_active: z.boolean().default(true),
});

export const UpdateFeatureSchema = z.object({
  parent_id: z.number().optional(),
  code: z.string().optional(),
  name: z.string().optional(),
  route_path: z.string().optional(),
  icon: z.string().optional(),
  sort_order: z.number().optional(),
  is_active: z.boolean().optional(),
});

export type CreateFeatureDTO = z.infer<typeof CreateFeatureSchema>;
export type UpdateFeatureDTO = z.infer<typeof UpdateFeatureSchema>;
