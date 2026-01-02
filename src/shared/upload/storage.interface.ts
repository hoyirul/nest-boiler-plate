// src/shared/upload/storage.interface.ts
export interface UploadResult {
  path: string;
  filename: string;
  mime: string;
  size: number;
}

export interface StorageDriver {
  upload(file: Express.Multer.File): Promise<UploadResult>;
}
