/*
 * Copyright (c) 2026 Madhai
 * src/modules/v1/approval/domains/approval.types.ts
 */

import { z } from "zod";

export const CreateApprovalSchema = z.object({
  model_type: z.string().min(1, "api.modules.approval.validation.model_type.required"),
  approver_id: z.string().min(1, "api.modules.approval.validation.approver_id.required"),
  step: z.number().min(1, "api.modules.approval.validation.step.required"),
  action_id: z.number().min(1, "api.modules.approval.validation.action.required"),
  remarks: z.string().nullable().default(null),
});

export const UpdateApprovalSchema = z.object({
  model_type: z.string().optional(),
  approver_id: z.string().optional(),
  step: z.number().optional(),
  action_id: z.number().optional(),
  remarks: z.string().optional(),
});

export type CreateApprovalDTO = z.infer<typeof CreateApprovalSchema>;
export type UpdateApprovalDTO = z.infer<typeof UpdateApprovalSchema>;
