/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/position/domains/position.types.ts
 */

import { z } from "zod";

export const CreatePositionSchema = z.object({
  name: z.string().min(1, "api.modules.position.validation.name.required").max(100, "api.modules.position.validation.name.max_length"),
  description: z.string().max(255, "api.modules.position.validation.description.max_length").optional(),
});

export const UpdatePositionSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export type CreatePositionDTO = z.infer<typeof CreatePositionSchema>;
export type UpdatePositionDTO = z.infer<typeof UpdatePositionSchema>;
