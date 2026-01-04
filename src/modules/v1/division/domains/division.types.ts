/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/division/domains/division.types.ts
 */

import { z } from "zod";

export const CreateDivisionSchema = z.object({
  name: z.string().min(1, "api.modules.division.validation.name.required"),
  description: z.string().max(255, "api.modules.division.validation.description.max_length").optional(),
});

export const UpdateDivisionSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

export type CreateDivisionDTO = z.infer<typeof CreateDivisionSchema>;
export type UpdateDivisionDTO = z.infer<typeof UpdateDivisionSchema>;
