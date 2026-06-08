import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'fs/promises';
import { createReadStream } from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import * as mime from 'mime-types';

/**
 * Storage wrapper. Two drivers:
 *
 * - `s3` (default): S3-compatible object store (MinIO/AWS).
 * - `local`: writes under `backend/uploads/<key>`; served by the `/uploads`
 *   static route in main.ts. Pick this for dev when no S3 is available.
 *
 * Driver chosen by `STORAGE_DRIVER` env. Falls back to `local` if S3 config
 * is missing so dev keeps working out of the box.
 */
@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly driver: 'local' | 's3';
  private readonly localRoot: string;
  private readonly client?: S3Client;
  private readonly bucket?: string;

  constructor() {
    const requested = (process.env.STORAGE_DRIVER ?? '').toLowerCase();
    const endpoint = process.env.S3_ENDPOINT;
    const bucket = process.env.S3_BUCKET;
    const accessKeyId = process.env.S3_ACCESS_KEY;
    const secretAccessKey = process.env.S3_SECRET_KEY;
    const hasS3Config = !!(endpoint && bucket && accessKeyId && secretAccessKey);

    if (requested === 'local' || (!requested && !hasS3Config)) {
      this.driver = 'local';
      this.localRoot = path.resolve(process.cwd(), 'uploads');
      this.logger.log(`Storage driver: local (${this.localRoot})`);
      return;
    }

    if (!hasS3Config) {
      throw new Error(
        'Missing S3 configuration. Set S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY and S3_SECRET_KEY, or set STORAGE_DRIVER=local.',
      );
    }

    this.driver = 's3';
    this.bucket = bucket;
    this.client = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      endpoint,
      forcePathStyle: (process.env.S3_FORCE_PATH_STYLE ?? 'true') !== 'false',
      credentials: { accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey! },
    });
    this.localRoot = path.resolve(process.cwd(), 'uploads');
    this.logger.log(`Storage driver: s3 (${endpoint}/${bucket})`);
  }

  private resolveLocal(key: string): string {
    const safe = key.replace(/^\/+/, '');
    if (safe.includes('..')) {
      throw new Error(`Invalid key: ${key}`);
    }
    return path.join(this.localRoot, safe);
  }

  /** Upload a buffer under `key`; returns the key for persistence. */
  async putObject(
    key: string,
    body: Buffer,
    contentType?: string,
  ): Promise<string> {
    if (this.driver === 'local') {
      const dest = this.resolveLocal(key);
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, body);
      return key;
    }
    await this.client!.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return key;
  }

  /** Fetch an object as a readable stream plus basic metadata. */
  async getObject(key: string): Promise<{
    stream: Readable;
    contentType?: string;
    contentLength?: number;
  }> {
    if (this.driver === 'local') {
      const src = this.resolveLocal(key);
      try {
        const stat = await fs.stat(src);
        return {
          stream: createReadStream(src),
          contentType: mime.lookup(src) || undefined,
          contentLength: stat.size,
        };
      } catch {
        throw new NotFoundException('File not found');
      }
    }
    try {
      const out = await this.client!.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return {
        stream: out.Body as Readable,
        contentType: out.ContentType,
        contentLength: out.ContentLength,
      };
    } catch {
      throw new NotFoundException('File not found');
    }
  }

  /** Best-effort delete; never throws (used when replacing old assets). */
  async deleteObject(key: string): Promise<void> {
    if (this.driver === 'local') {
      try {
        await fs.unlink(this.resolveLocal(key));
      } catch (err) {
        this.logger.warn(`Failed to delete local ${key}: ${String(err)}`);
      }
      return;
    }
    try {
      await this.client!.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch (err) {
      this.logger.warn(`Failed to delete S3 ${key}: ${String(err)}`);
    }
  }
}
