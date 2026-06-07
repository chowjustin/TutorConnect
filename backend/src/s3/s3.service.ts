import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Readable } from 'stream';

/**
 * Thin wrapper around an S3-compatible object store (MinIO in production).
 *
 * Objects are stored under bare relative keys that mirror the old on-disk
 * folder layout, e.g. `profile/<uuid>.jpg`, `materials/<uuid>.pdf`,
 * `payments/<uuid>.png`. The same key is persisted in the database, so the
 * public `/uploads/<key>` route can stream the object straight back.
 */
@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    const endpoint = process.env.S3_ENDPOINT;
    const bucket = process.env.S3_BUCKET;
    const accessKeyId = process.env.S3_ACCESS_KEY;
    const secretAccessKey = process.env.S3_SECRET_KEY;

    if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
      // Fail fast on boot rather than on the first upload.
      throw new Error(
        'Missing S3 configuration. Set S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY and S3_SECRET_KEY.',
      );
    }

    this.bucket = bucket;
    this.client = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      endpoint,
      // MinIO uses path-style addressing (https://endpoint/bucket/key) unless
      // wildcard-DNS virtual-host style is configured. Default to path-style.
      forcePathStyle: (process.env.S3_FORCE_PATH_STYLE ?? 'true') !== 'false',
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  /** Upload a buffer under `key`; returns the key for persistence. */
  async putObject(
    key: string,
    body: Buffer,
    contentType?: string,
  ): Promise<string> {
    await this.client.send(
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
    try {
      const out = await this.client.send(
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
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch (err) {
      this.logger.warn(`Failed to delete object ${key}: ${String(err)}`);
    }
  }
}
