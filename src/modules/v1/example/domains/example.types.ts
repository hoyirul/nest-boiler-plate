// src/modules/example/v1/validators/example.validator.ts
import { z } from "zod";

export const CreateExampleSchema = z.object({
  name: z.string().min(1, "api.modules.example.validation.name.required").max(100, "api.modules.example.validation.name.max_length"),
  attachment: z.string().optional(),
});

export const UpdateExampleSchema = z.object({
  name: z.string().min(1, "api.modules.example.validation.name.required").optional(),
  attachment: z.string().optional(),
});

export type CreateExampleDTO = z.infer<typeof CreateExampleSchema>;
export type UpdateExampleDTO = z.infer<typeof UpdateExampleSchema>;