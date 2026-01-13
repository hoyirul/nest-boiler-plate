/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/status/domains/status.types.ts
 */

import { z } from "zod";

export const CreateStatusSchema = z.object({
  code: z.string().min(1, "api.modules.status.validation.code.required"),
  label: z.string().min(1, "api.modules.status.validation.label.required"),
  sort_order: z.number().min(1, "api.modules.status.validation.sort_order.required"),
});

export const UpdateStatusSchema = z.object({
  code: z.string().optional(),
  label: z.string().optional(),
  sort_order: z.number().optional(),
});

export type CreateStatusDTO = z.infer<typeof CreateStatusSchema>;
export type UpdateStatusDTO = z.infer<typeof UpdateStatusSchema>;
