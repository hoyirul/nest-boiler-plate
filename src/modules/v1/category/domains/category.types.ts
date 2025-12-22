// src/modules/user/v1/validators/user.validator.ts
import { z } from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().min(1, "api.modules.category.validation.name.required").max(100, "api.modules.category.validation.name.max_length"),
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(1, "api.modules.category.validation.name.required").optional(),
});

export type CreateCategoryDTO = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof UpdateCategorySchema>;