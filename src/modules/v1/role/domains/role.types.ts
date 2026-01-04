import { z } from "zod";

export const CreateRoleSchema = z.object({
  name: z.string().min(1, "api.modules.role.validation.name.required").max(100, "api.modules.role.validation.name.max_length"),
});

export const UpdateRoleSchema = z.object({
  name: z.string().min(1, "api.modules.role.validation.name.required").max(100, "api.modules.role.validation.name.max_length").optional(),
});

// RBAC
export const AssignRoleSchema = z.object({
  role_id: z.number().min(1, "api.modules.role.validation.assign.role_id.required"),
  model_id: z.string().min(1, "api.modules.role.validation.assign.model_id.required").max(36, "api.modules.role.validation.assign.model_id.max_length"),
});

export const RevokeRoleSchema = z.object({
  role_id: z.number().min(1, "api.modules.role.validation.assign.role_id.required"),
  model_id: z.string().min(1, "api.modules.role.validation.assign.model_id.required").max(36, "api.modules.role.validation.assign.model_id.max_length"),
});

export type CreateRoleDTO = z.infer<typeof CreateRoleSchema>;
export type UpdateRoleDTO = z.infer<typeof UpdateRoleSchema>;

// RBAC
export type AssignRoleDTO = z.infer<typeof AssignRoleSchema>;
export type RevokeRoleDTO = z.infer<typeof RevokeRoleSchema>;