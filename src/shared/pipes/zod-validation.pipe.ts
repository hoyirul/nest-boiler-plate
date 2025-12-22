import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
} from "@nestjs/common";
import * as zod from "zod";
import { ValidationError } from "@/shared/utils/errors";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(
    private readonly schema: zod.ZodSchema,
  ) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field =
          issue.path.length > 0 ? String(issue.path[0]) : "unknown";
        errors[field] = issue.message;
      });
      throw ValidationError("api.common.validation_failed", errors);
    }

    return result.data;
  }
}
