// src/modules/example/v1/validators/example.validator.ts
import { z } from "zod";

export const CreatePermissionSchema = z.object({
  name: z.string().min(1, "api.modules.permission.validation.name.required").max(100, "api.modules.permission.validation.name.max_length"),
});

export const UpdatePermissionSchema = z.object({
  name: z.string().min(1, "api.modules.permission.validation.name.required").max(100, "api.modules.permission.validation.name.max_length").optional(),
});

export const AssignPermissionRoleSchema = z.object({
  permission_ids: z
    .array(
      z
        .number()
        .min(1, "api.modules.permission.validation.assign.permission_id.required")
    )
    .min(1, "api.modules.permission.validation.assign.permission_ids.required"),
  role_id: z.number().min(1, "api.modules.permission.validation.assign.role_id.required"),
});

export const RevokePermissionRoleSchema = z.object({
  permission_ids: z
    .array(
      z
        .number()
        .min(1, "api.modules.permission.validation.assign.permission_id.required")
    )
    .min(1, "api.modules.permission.validation.assign.permission_ids.required"),
  role_id: z.number().min(1, "api.modules.permission.validation.assign.role_id.required"),
});

export const AssignPermissionUserSchema = z.object({
  permission_ids: z
    .array(
      z
        .number()
        .min(1, "api.modules.permission.validation.assign.permission_id.required")
    )
    .min(1, "api.modules.permission.validation.assign.permission_ids.required"),
  model_id: z.string().min(1, "api.modules.permission.validation.assign.model_id.required").max(36, "api.modules.permission.validation.assign.model_id.max_length"),
});

export const RevokePermissionUserSchema = z.object({
  permission_ids: z
    .array(
      z
        .number()
        .min(1, "api.modules.permission.validation.assign.permission_id.required")
    )
    .min(1, "api.modules.permission.validation.assign.permission_ids.required"),
  model_id: z.string().min(1, "api.modules.permission.validation.assign.model_id.required").max(36, "api.modules.permission.validation.assign.model_id.max_length"),
});

export type CreatePermissionDTO = z.infer<typeof CreatePermissionSchema>;
export type UpdatePermissionDTO = z.infer<typeof UpdatePermissionSchema>;

export type AssignPermissionRoleDTO = z.infer<typeof AssignPermissionRoleSchema>;
export type RevokePermissionRoleDTO = z.infer<typeof RevokePermissionRoleSchema>;

export type AssignPermissionUserDTO = z.infer<typeof AssignPermissionUserSchema>;
export type RevokePermissionUserDTO = z.infer<typeof RevokePermissionUserSchema>;
