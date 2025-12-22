import { ZodError, ZodSchema } from "zod";
import { getMessage } from "@/shared/lang";
import { ValidationError } from "@/shared/utils/errors";

type ZodFieldErrors = Record<string, string>;

/**
 * Convert ZodError into keyed object
 * {
 *   fieldName: "message",
 *   ...
 * }
 */
export const parseZodErrors = (error: ZodError): ZodFieldErrors => {
  const formatted: ZodFieldErrors = {};

  for (const issue of error.issues) {
    const key = issue.path.length ? String(issue.path[0]) : "unknown";
    // hanya ambil error pertama per field
    if (!formatted[key]) {
      formatted[key] = issue.message;
    }
  }

  return formatted;
};

/**
 * Validate payload using Zod schema and throw AppError if invalid
 */
export const validateOrThrow = <T>(
  schema: ZodSchema<T>,
  payload: unknown,
  lang: string = "id"
): T => {
  const result = schema.safeParse(payload);

  if (!result.success) {
    const errors = parseZodErrors(result.error);

    const localizedErrors = Object.fromEntries(
      Object.entries(errors).map(([field, msgKey]) => [
        field,
        getMessage(lang, msgKey),
      ])
    );

    throw ValidationError(
      "api.common.validation_failed",
      localizedErrors
    );
  }

  return result.data;
};
