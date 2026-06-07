import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeaturedService {
  constructor(private prisma: PrismaService) {}

  async prepareRequest(tutorEmail: string, days: number) {
    const user = await this.prisma.user.findUnique({
      where: { email: tutorEmail },
      include: { tutorProfile: true },
    });
    if (!user?.tutorProfile) throw new NotFoundException('Tutor not found');
    const perDay = parseInt(process.env.FEATURED_PRICE_PER_DAY || '5000', 10);
    return {
      kind: 'FEATURED_LISTING' as const,
      refId: String(days),
      amount: perDay * days,
    };
  }

  async expireOldCron() {
    await this.prisma.featuredListing.deleteMany({
      where: { activeUntil: { lt: new Date() } },
    });
  }
}
