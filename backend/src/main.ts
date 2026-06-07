import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { S3Service } from './s3/s3.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Behind nginx: trust the first proxy hop so req.ip / x-forwarded-proto are
  // honoured (correct client IP for rate limiting, https in built file URLs).
  app.set('trust proxy', 1);

  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({
    origin: corsOrigin
      ? corsOrigin.split(',').map((s) => s.trim())
      : 'http://localhost:3001',
    credentials: true,
  });

  // Public asset gateway: streams objects from object storage (MinIO) at the
  // same `/uploads/<key>` paths the old on-disk static handler served, so
  // stored keys (profile/, payments/, payouts/, verification/, materials/)
  // resolve unchanged. Mounted outside the global `/api` prefix.
  const s3 = app.get(S3Service);
  app.use('/uploads', async (req: Request, res: Response) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.status(405).end();
      return;
    }
    const key = decodeURIComponent(req.path.replace(/^\/+/, ''));
    if (!key || key.includes('..')) {
      res.status(400).end();
      return;
    }
    try {
      const { stream, contentType, contentLength } = await s3.getObject(key);
      if (contentType) res.setHeader('Content-Type', contentType);
      if (contentLength != null)
        res.setHeader('Content-Length', String(contentLength));
      res.setHeader('Cache-Control', 'public, max-age=86400');
      stream.pipe(res);
    } catch {
      res.status(404).end();
    }
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.setGlobalPrefix('api');

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('DBBConnect API')
      .setVersion('0.1')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(process.env.PORT || 8000);
}
bootstrap();
