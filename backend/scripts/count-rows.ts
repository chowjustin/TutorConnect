/**
 * Print row counts for write-heavy tables. Diagnostic.
 *
 * Run: pnpm ts-node scripts/count-rows.ts
 */
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();

(async () => {
  const counts = {
    users: await p.user.count(),
    tutorProfiles: await p.tutorProfile.count(),
    studentProfiles: await p.studentProfile.count(),
    applications: await p.application.count(),
    sessions: await p.session.count(),
    sessionAttendees: await p.sessionAttendee.count(),
    availabilitySlots: await p.availabilitySlot.count(),
    materials: await p.material.count(),
    materialAccess: await p.materialAccess.count(),
    reviews: await p.review.count(),
    payments: await p.payment.count(),
    platformBankAccounts: await p.platformBankAccount.count(),
    subscriptions: await p.subscription.count(),
    featuredListings: await p.featuredListing.count(),
    promoCodes: await p.promoCode.count(),
    studentCredits: await p.studentCredit.count(),
    tutorWallets: await p.tutorWallet.count(),
    walletLedgers: await p.walletLedger.count(),
    payouts: await p.payout.count(),
    referralRewards: await p.referralReward.count(),
    materialViews: await p.materialView.count(),
    sessionFeedbacks: await p.sessionFeedback.count(),
    idempotencyKeys: await p.idempotencyKey.count(),
  };
  console.table(counts);
  await p.$disconnect();
})();
