// src/shared/utils/file.ts
import { randomUUID } from "crypto";
import path from "path";
import * as fs from 'fs';
import { env } from '@/core/config/env';
import { AppError } from './errors';
import { Loggers } from "@/shared/utils/logger";

export function generateFileName(
  module: string,
  originalName: string
) {
  const ext = path.extname(originalName);
  const now = new Date();

  return [
    module,
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    `${randomUUID()}${ext}`,
  ].join("/");
}

/**
 * Replace an old file with a newly uploaded file
 * @param oldFilePath path of the old file in DB (relative from storage root)
 * @param uploadedFile the newly uploaded Express.Multer.File
 * @param moduleName the module name (e.g., 'example')
 * @returns the new file path to store in DB
 */
export async function replaceFile(
  oldFilePath: string | null | undefined,
  uploadedFile: Express.Multer.File,
  moduleName: string
): Promise<string> {
  if (!uploadedFile) {
    throw new AppError('Validation', 'api.common.validation_failed');
  }

  // build the new file path based on storage config
  const newFilePath = path.join(env.UPLOAD_DIR, moduleName, uploadedFile.filename);

  // delete old file if exists
  if (oldFilePath) {
    const fullOldPath = path.join(process.cwd(), oldFilePath); // relative to project root
    if (fs.existsSync(fullOldPath)) {
      try {
        fs.unlinkSync(fullOldPath);
      } catch (err) {
        Loggers.general.error(`Failed to delete old file at ${fullOldPath}: ${(err as Error).message}`);
      }
    }
  }

  return newFilePath;
}

