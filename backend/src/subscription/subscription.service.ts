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

  /** Returns refId (the tier string) to use with POST /payments/upload-proof */
  prepareRequest(tier: PlanTier) {
    if (tier === PlanTier.FREE) {
      throw new NotFoundException('Cannot purchase FREE');
    }
    return { kind: 'SUBSCRIPTION', refId: tier };
  }

  async expireOldCron() {
    await this.prisma.subscription.updateMany({
      where: { expiresAt: { lt: new Date() }, tier: { not: PlanTier.FREE } },
      data: { tier: PlanTier.FREE, expiresAt: null },
    });
  }
}
