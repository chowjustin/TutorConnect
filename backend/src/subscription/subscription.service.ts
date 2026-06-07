import { Injectable, NotFoundException } from '@nestjs/common';
import { PlanTier } from '@prisma/client';
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

  /** Returns refId, kind and amount for the FE checkout flow. */
  prepareRequest(tier: PlanTier) {
    if (tier === PlanTier.FREE) {
      throw new NotFoundException('Cannot purchase FREE');
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

  async expireOldCron() {
    await this.prisma.subscription.updateMany({
      where: { expiresAt: { lt: new Date() }, tier: { not: PlanTier.FREE } },
      data: { tier: PlanTier.FREE, expiresAt: null },
    });
  }
}
