// src/core/config/storage.ts
import { env } from '@/core/config/env';

export const storageConfig = () => ({
  driver: env.UPLOAD_DRIVER || 'local',
  dir: env.UPLOAD_DIR || 'storage/app',
  maxSize: Number(env.UPLOAD_MAX_SIZE || 2_000_000),
  allowedMime: (env.UPLOAD_ALLOWED_MIME || '').split(','),
});

// URL Example: http://your-domain.com/storage/MODULE_NAME/filename.ext
export const storageUrl = (path: string) => {
  return `${env.PUBLIC_URL}/storage/${path}`;
}
