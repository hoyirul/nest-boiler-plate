import { Injectable, PipeTransform } from "@nestjs/common";
import { AppError } from "@/shared/utils/errors";
import { storageConfig } from "@/core/config/storage";

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File, { metatype }: any) {
    const errors: Record<string, string> = {};
    const lang = (metatype && metatype.lang) || 'id'; // fallback lang

    if (!file) {
      errors['attachment'] = 'api.modules.example.validation.attachment.required';
    } else {
      const config = storageConfig();
      if (!config.allowedMime.includes(file.mimetype)) {
        errors['attachment'] = 'api.modules.example.validation.attachment.invalid_type';
      }
      if (file.size > config.maxSize) {
        errors['attachment'] = 'api.modules.example.validation.attachment.max_size';
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new AppError('Validation', 'api.common.validation_failed', errors);
    }

    return file;
  }
}
