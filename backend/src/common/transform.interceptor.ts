import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { isPaginated, PaginationMeta } from './dto/paginated.dto';
import { SKIP_TRANSFORM_KEY } from './skip-transform.decorator';

export interface ApiResponseEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedApiEnvelope<T> extends ApiResponseEnvelope<T[]> {
  meta: PaginationMeta;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, unknown> {
  constructor(private readonly reflector: Reflector) {}

  intercept(ctx: ExecutionContext, next: CallHandler<T>): Observable<unknown> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_TRANSFORM_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (skip) return next.handle();

    const res = ctx.switchToHttp().getResponse();

    return next.handle().pipe(
      map((body) => {
        if (body instanceof StreamableFile || Buffer.isBuffer(body)) return body;
        if (body === undefined || body === null) {
          return { code: res.statusCode ?? 200, message: 'OK', data: null };
        }
        const code = res.statusCode ?? 200;
        if (isPaginated<unknown>(body)) {
          return {
            code,
            message: 'OK',
            data: body.data,
            meta: body.meta,
          } satisfies PaginatedApiEnvelope<unknown>;
        }
        return {
          code,
          message: 'OK',
          data: body,
        } satisfies ApiResponseEnvelope<unknown>;
      }),
    );
  }
}
