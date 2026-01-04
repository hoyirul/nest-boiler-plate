import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string().min(1, "api.modules.user.validation.name.required").max(100, "api.modules.user.validation.name.max_length"),
  email: z.email("api.modules.user.validation.email.invalid").max(255, "api.modules.user.validation.email.max_length"),
  password: z.string().min(8, "api.modules.user.validation.password.min_length").max(255, "api.modules.user.validation.password.max_length"),
  confirm_password: z.string().min(8, "api.modules.user.validation.confirm_password.min_length").max(255, "api.modules.user.validation.confirm_password.max_length"),
}).refine((data) => data.password === data.confirm_password, {
  message: "api.modules.user.confirm_password_mismatch",
  path: ["confirm_password"],
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1, "api.modules.user.validation.name.required").max(100, "api.modules.user.validation.name.max_length").optional(),
});

// RBAC
export const UpdatePasswordSchema = z.object({
  current_password: z.string().min(1, "api.modules.user.validation.current_password.required").max(255, "api.modules.user.validation.current_password.max_length"),
  new_password: z.string().min(8, "api.modules.user.validation.new_password.min_length").max(255, "api.modules.user.validation.new_password.max_length"),
  confirm_password: z.string().min(8, "api.modules.user.validation.confirm_password.min_length").max(255, "api.modules.user.validation.confirm_password.max_length"),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "api.modules.user.confirm_password_mismatch",
  path: ["confirm_password"],
});

export const UpdateEmailSchema = z.object({
  email: z.email("api.modules.user.validation.email.invalid").max(255, "api.modules.user.validation.email.max_length"),
});

export const UpdateStatusSchema = z.object({
  status: z.enum(["active", "inactive", "banned"], {
    message: "api.modules.user.validation.status.invalid",
  })
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;
export type UpdatePasswordDTO = z.infer<typeof UpdatePasswordSchema>;
export type UpdateEmailDTO = z.infer<typeof UpdateEmailSchema>;
export type UpdateStatusDTO = z.infer<typeof UpdateStatusSchema>;