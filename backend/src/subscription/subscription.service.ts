import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PaymentKind, PaymentStatus, PlanTier, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  async getMine(userId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    if (!sub) return { tier: PlanTier.FREE, expiresAt: null };
    return sub;
  }

  async hasPending(userId: string) {
    const pending = await this.prisma.payment.findFirst({
      where: {
        payerId: userId,
        kind: PaymentKind.SUBSCRIPTION,
        status: PaymentStatus.UNDER_REVIEW,
      },
      orderBy: { createdAt: 'desc' },
    });
    return pending;
  }

  /** Returns refId, kind and amount for the FE checkout flow. */
  async prepareRequest(userId: string, role: UserRole, tier: PlanTier) {
    if (tier === PlanTier.FREE) {
      throw new BadRequestException('Cannot purchase FREE');
    }

    if (tier === PlanTier.PREMIUM_STUDENT && role !== UserRole.STUDENT) {
      throw new ForbiddenException(
        'PREMIUM_STUDENT hanya untuk akun siswa',
      );
    }
    if (tier === PlanTier.PRO_TUTOR && role !== UserRole.TUTOR) {
      throw new ForbiddenException('PRO_TUTOR hanya untuk akun tutor');
    }

    const pending = await this.hasPending(userId);
    if (pending) {
      throw new BadRequestException(
        'Masih ada permintaan langganan yang sedang ditinjau',
      );
    }

    const PRICES: Record<Exclude<PlanTier, 'FREE'>, number> = {
      PREMIUM_STUDENT: parseInt(
        process.env.PRICE_PREMIUM_STUDENT || '50000',
        10,
      ),
      PRO_TUTOR: parseInt(process.env.PRICE_PRO_TUTOR || '100000', 10),
    };
    return {
      kind: 'SUBSCRIPTION' as const,
      refId: tier as string,
      amount: PRICES[tier as Exclude<PlanTier, 'FREE'>],
    };
  }

  async listMyHistory(userId: string) {
    return this.prisma.payment.findMany({
      where: { payerId: userId, kind: PaymentKind.SUBSCRIPTION },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async expireOldCron() {
    await this.prisma.subscription.updateMany({
      where: { expiresAt: { lt: new Date() }, tier: { not: PlanTier.FREE } },
      data: { tier: PlanTier.FREE, expiresAt: null },
    });
  }
}

