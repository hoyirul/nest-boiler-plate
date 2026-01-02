// src/shared/upload/drivers/s3.driver.ts
import { S3 } from 'aws-sdk';
import { StorageDriver, UploadResult } from '../storage.interface';

export class S3StorageDriver implements StorageDriver {
  private s3 = new S3({
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!,
    },
  });

  async upload(file: Express.Multer.File): Promise<UploadResult> {
    const result = await this.s3.upload({
      Bucket: process.env.S3_BUCKET!,
      Key: `${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    }).promise();

    return {
      path: result.Location,
      filename: result.Key,
      mime: file.mimetype,
      size: file.size,
    };
  }
}
