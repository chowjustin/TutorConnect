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
    // tutorId is stored as payeeTutorId via subsequent payment row
    return { kind: 'FEATURED_LISTING', refId: String(days) };
  }

  async expireOldCron() {
    await this.prisma.featuredListing.deleteMany({
      where: { activeUntil: { lt: new Date() } },
    });
  }
}
