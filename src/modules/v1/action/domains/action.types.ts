/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/action/domains/action.types.ts
 */

import { z } from "zod";

export const CreateActionSchema = z.object({
  code: z.string().min(1, "api.modules.action.validation.code.required"),
  label: z.string().min(1, "api.modules.action.validation.label.required"),
  sort_order: z.number().min(1, "api.modules.action.validation.sort_order.required"),
});

export const UpdateActionSchema = z.object({
  code: z.string().optional(),
  label: z.string().optional(),
  sort_order: z.number().optional(),
});

export type CreateActionDTO = z.infer<typeof CreateActionSchema>;
export type UpdateActionDTO = z.infer<typeof UpdateActionSchema>;
