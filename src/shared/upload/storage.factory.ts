// src/shared/upload/storage.factory.ts
import { storageConfig } from '@/core/config/storage';
import { LocalStorageDriver } from './drivers/local.driver';
import { S3StorageDriver } from './drivers/s3.driver';

export function createStorageDriver() {
  const config = storageConfig();

  if (config.driver === 's3') {
    return new S3StorageDriver();
  }

  return new LocalStorageDriver();
}
