import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
} from "@nestjs/common";
import * as zod from "zod";
import { ValidationError } from "@/shared/utils/errors";
import { getMessage } from "@/shared/lang";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(
    private readonly schema: zod.ZodSchema,
  ) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const errors: Record<string, string> = {};
      const lang = (typeof value === "object" && value !== null && "lang" in value)
        ? (value as any).lang
        : "id";

      result.error.issues.forEach((issue) => {
        // bikin nested path proper: address.street, etc
        const field = issue.path.length ? issue.path.join(".") : "unknown";

        // optional: translate message / custom message
        const msg =
          issue.message.startsWith("Invalid input")
            ? getMessage(lang, "api.common.validation_failed")
            : getMessage(lang, issue.message) || issue.message;

        errors[field] = msg;
      });

      throw ValidationError("api.common.validation_failed", errors);
    }

    return result.data;
  }
}
