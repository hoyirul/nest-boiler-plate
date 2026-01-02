// src/core/config/storage.ts
export const storageConfig = () => ({
  driver: process.env.UPLOAD_DRIVER || 'local',
  dir: process.env.UPLOAD_DIR || 'uploads',
  maxSize: Number(process.env.UPLOAD_MAX_SIZE || 2_000_000),
  allowedMime: (process.env.UPLOAD_ALLOWED_MIME || '').split(','),
});
