import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActivityInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest();
    const userId = req.user?.sub;
    return next.handle().pipe(
      tap(() => {
        if (userId) {
          this.prisma.userActivity
            .upsert({
              where: { userId },
              update: { lastSeenAt: new Date() },
              create: { userId, lastSeenAt: new Date() },
            })
            .catch(() => {});
        }
      }),
    );
  }
}
