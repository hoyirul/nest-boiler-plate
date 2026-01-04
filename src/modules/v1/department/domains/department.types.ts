/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/department/domains/department.types.ts
 */

import { z } from "zod";

export const CreateDepartmentSchema = z.object({
  division_id: z.number().min(1, "api.modules.department.validation.division_id.required"),
  name: z.string().min(1, "api.modules.department.validation.name.required"),
  description: z.string().max(255, "api.modules.department.validation.description.max_length").optional(),
});

export const UpdateDepartmentSchema = z.object({
  division_id: z.number().min(1, "api.modules.department.validation.division_id.required").optional(),
  name: z.string().optional(),
  description: z.string().optional(),
});

export type CreateDepartmentDTO = z.infer<typeof CreateDepartmentSchema>;
export type UpdateDepartmentDTO = z.infer<typeof UpdateDepartmentSchema>;
