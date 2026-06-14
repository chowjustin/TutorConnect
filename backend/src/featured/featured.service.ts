import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentKind, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeaturedService {
  constructor(private prisma: PrismaService) {}

  private async getTutor(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { tutorProfile: true },
    });
    if (!user?.tutorProfile) throw new NotFoundException('Tutor not found');
    return { user, tutorProfile: user.tutorProfile };
  }

  async getMine(email: string) {
    const { tutorProfile } = await this.getTutor(email);
    const listing = await this.prisma.featuredListing.findUnique({
      where: { tutorId: tutorProfile.id },
    });
    return listing ?? null;
  }

  async hasPending(userId: string) {
    return this.prisma.payment.findFirst({
      where: {
        payerId: userId,
        kind: PaymentKind.FEATURED_LISTING,
        status: PaymentStatus.UNDER_REVIEW,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listMyHistory(userId: string) {
    return this.prisma.payment.findMany({
      where: { payerId: userId, kind: PaymentKind.FEATURED_LISTING },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async prepareRequest(tutorEmail: string, days: number) {
    const { user } = await this.getTutor(tutorEmail);

    const pending = await this.hasPending(user.id);
    if (pending) {
      throw new BadRequestException(
        'Masih ada permintaan featured yang sedang ditinjau',
      );
    }

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
