// src/modules/auth/v1/validators/auth.validator.ts
import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email("api.modules.auth.validation.email.invalid"),
  password: z.string().min(6, "api.modules.auth.validation.password.min_length"),
});

export type LoginDTO = z.infer<typeof LoginSchema>;
