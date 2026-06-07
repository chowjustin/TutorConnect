import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SessionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { FeaturedService } from '../featured/featured.service';

@Injectable()
export class CronService {
  private readonly log = new Logger(CronService.name);
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
    private subscription: SubscriptionService,
    private featured: FeaturedService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sessionReminders() {
    const inDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const sessions = await this.prisma.session.findMany({
      where: {
        status: SessionStatus.SCHEDULED,
        startsAt: { lte: inDay, gte: new Date() },
        reminderSentAt: null,
      },
      include: {
        tutor: { include: { user: true } },
        attendees: { include: { student: { include: { user: true } } } },
      },
    });
    for (const s of sessions) {
      const targets = [
        s.tutor.user.email,
        ...s.attendees.map((a) => a.student.user.email),
      ];
      for (const email of targets) {
        await this.mail
          .sendEmail(
            email,
            'Session reminder',
            `You have a session at ${s.startsAt.toISOString()}`,
          )
          .catch(() => {});
      }
      await this.prisma.session.update({
        where: { id: s.id },
        data: { reminderSentAt: new Date() },
      });
    }
    if (sessions.length > 0) {
      this.log.log(`Sent reminders for ${sessions.length} sessions`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireSubscriptions() {
    await this.subscription.expireOldCron();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireFeatured() {
    await this.featured.expireOldCron();
  }

  // Retention crons (commit 13 work) folded here
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async retention() {
    const day90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const day7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await this.prisma.materialView.deleteMany({
      where: { viewedAt: { lt: day90 } },
    });
    await this.prisma.searchLog.deleteMany({
      where: { createdAt: { lt: day90 } },
    });
    await this.prisma.idempotencyKey.deleteMany({
      where: { createdAt: { lt: day7 } },
    });
    await this.prisma.passwordResetToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    await this.prisma.emailVerificationToken.deleteMany({
      where: { expiresAt: { lt: new Date() }, usedAt: { not: null } },
    });
  }
}
