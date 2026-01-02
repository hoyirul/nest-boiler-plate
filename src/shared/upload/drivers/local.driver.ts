// src/shared/upload/drivers/local.driver.ts
import { StorageDriver, UploadResult } from '@/shared/upload/storage.interface';

export class LocalStorageDriver implements StorageDriver {
  async upload(file: Express.Multer.File): Promise<UploadResult> {
    return {
      path: file.path,
      filename: file.filename,
      mime: file.mimetype,
      size: file.size,
    };
  }
}
