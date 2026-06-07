import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type { Request } from 'express';
import { memoryStorage } from 'multer';
import { extname } from 'path';

type CbBool = (error: Error | null, acceptFile: boolean) => void;

/**
 * Files are buffered in memory and then streamed to object storage (MinIO)
 * by the controller/service. We never touch local disk.
 */
export const multerStorage = memoryStorage();

/**
 * Build a bare object key for `prefix` (e.g. `payments`) using a random UUID
 * and the original extension, e.g. `payments/3f2c....png`. The same key is
 * persisted in the DB and served back via the public `/uploads/<key>` route.
 */
export function objectKey(prefix: string, originalname: string): string {
  const ext = extname(originalname).toLowerCase();
  return `${prefix}/${randomUUID()}${ext}`;
}

const IMAGE_MIME = /^image\/(png|jpe?g)$/;

export const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: CbBool,
) => {
  if (!IMAGE_MIME.test(file.mimetype)) {
    cb(new BadRequestException('Only PNG or JPEG images allowed'), false);
    return;
  }
  cb(null, true);
};

export const materialFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: CbBool,
) => {
  if (IMAGE_MIME.test(file.mimetype) || file.mimetype === 'application/pdf') {
    cb(null, true);
    return;
  }
  cb(new BadRequestException('Only PNG, JPEG or PDF allowed'), false);
};

export const multerLimits = {
  fileSize: 20 * 1024 * 1024,
};
