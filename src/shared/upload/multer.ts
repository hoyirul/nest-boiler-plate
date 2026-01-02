// src/shared/upload/multer.ts
import { diskStorage } from 'multer';
import { storageConfig } from '@/core/config/storage';
import { generateFileName } from "@/shared/utils/file";

export function multerOptions(
  MODULE_NAME: string
) {
  const config = storageConfig();

  const dirPath = config.dir + '/' + MODULE_NAME;

  if (!require('fs').existsSync(dirPath)){
    require('fs').mkdirSync(dirPath, { recursive: true, mode: 0o755 });
  }

  return {
    limits: { fileSize: config.maxSize },
    fileFilter: (_req: any, file: { mimetype: string; }, cb: (arg0: Error | null, arg1: boolean) => void) => {
      cb(null, true);
    },
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, dirPath);
      },
      filename: (_req, file, cb) => {
        const filename = generateFileName(MODULE_NAME, file.originalname);
        cb(null, filename.replace(/\//g, "_"));
      },
    }),
  };
}
