import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const REFERRER_REWARD = parseInt(
  process.env.REFERRAL_REWARD_REFERRER_RUPIAH || '25000',
  10,
);
const REFERRED_REWARD = parseInt(
  process.env.REFERRAL_REWARD_REFERRED_RUPIAH || '25000',
  10,
);

@Injectable()
export class ReferralsService {
  constructor(private prisma: PrismaService) {}

  static generateCode() {
    return randomBytes(4).toString('hex').toUpperCase();
  }

  async resolveReferrer(code?: string) {
    if (!code) return null;
    const user = await this.prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });
    return user?.id ?? null;
  }

  async getMine(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });
    const rewards = await this.prisma.referralReward.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' },
    });
    const totalGranted = rewards
      .filter((r) => r.status === 'GRANTED')
      .reduce((acc, r) => acc + r.creditAmount, 0);
    return { code: user?.referralCode, rewards, totalGranted };
  }

  async maybeCreateRewardOnFirstSession(paymentId: string, payerId: string) {
    const payer = await this.prisma.user.findUnique({
      where: { id: payerId },
      select: { referredById: true },
    });
    if (!payer?.referredById) return;
    // Check if this is referred user's first SESSION CONFIRMED
    const otherSessionPayments = await this.prisma.payment.count({
      where: {
        payerId,
        kind: 'SESSION',
        status: 'CONFIRMED',
        id: { not: paymentId },
      },
    });
    if (otherSessionPayments > 0) return;

    await this.prisma.referralReward.create({
      data: {
        referrerId: payer.referredById,
        referredId: payerId,
        triggeredByPaymentId: paymentId,
        creditAmount: REFERRER_REWARD,
        status: 'PENDING',
      },
    });
  }

  async grant(rewardId: string) {
    const reward = await this.prisma.referralReward.findUnique({
      where: { id: rewardId },
    });
    if (!reward) throw new NotFoundException('Reward not found');
    if (reward.status === 'GRANTED') return reward;

    return this.prisma.$transaction(async (tx) => {
      await tx.referralReward.update({
        where: { id: rewardId },
        data: { status: 'GRANTED' },
      });
      // Credit referrer (tutor wallet if tutor, student credit otherwise)
      const referrer = await tx.user.findUnique({
        where: { id: reward.referrerId },
        include: { tutorProfile: true },
      });
      if (referrer?.tutorProfile) {
        await tx.tutorWallet.upsert({
          where: { tutorId: referrer.tutorProfile.id },
          update: {
            availableBalance: { increment: reward.creditAmount },
            lifetimeEarned: { increment: reward.creditAmount },
          },
          create: {
            tutorId: referrer.tutorProfile.id,
            availableBalance: reward.creditAmount,
            lifetimeEarned: reward.creditAmount,
          },
        });
        await tx.walletLedger.create({
          data: {
            tutorId: referrer.tutorProfile.id,
            delta: reward.creditAmount,
            reason: 'REFERRAL_REWARD',
          },
        });
      } else {
        await tx.studentCredit.upsert({
          where: { studentUserId: reward.referrerId },
          update: { balance: { increment: reward.creditAmount } },
          create: {
            studentUserId: reward.referrerId,
            balance: reward.creditAmount,
          },
        });
      }
      // Also credit referred user
      await tx.studentCredit.upsert({
        where: { studentUserId: reward.referredId },
        update: { balance: { increment: REFERRED_REWARD } },
        create: {
          studentUserId: reward.referredId,
          balance: REFERRED_REWARD,
        },
      });
      return tx.referralReward.findUnique({ where: { id: rewardId } });
    });
  }
}
