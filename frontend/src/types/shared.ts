import type { Role } from './api';

// Re-export for convenience
export type { Role } from './api';

// User entity (safe fields only; backend strips password)
export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  role: Role;
  emailVerifiedAt: string | null;
  referralCode: string | null;
  referredById: string | null;
  createdAt: string;
  updatedAt: string;
}

// Prisma enums mirrored. Keep in sync with backend/prisma/schema.prisma.
export type Subject =
  | 'MATH'
  | 'PHYSICS'
  | 'CHEMISTRY'
  | 'BIOLOGY'
  | 'ENGLISH'
  | 'INDONESIAN'
  | 'HISTORY'
  | 'GEOGRAPHY'
  | 'ECONOMICS'
  | 'COMPUTER_SCIENCE'
  | 'ART'
  | 'MUSIC';

export type EducationLevel =
  | 'KINDERGARTEN'
  | 'ELEMENTARY'
  | 'JUNIOR_HIGH'
  | 'SENIOR_HIGH'
  | 'UNIVERSITY'
  | 'ADULT';

export type TeachingMethod = 'ONLINE' | 'OFFLINE' | 'HYBRID';

export type MaterialKind = 'PDF' | 'IMAGE' | 'VIDEO' | 'LINK' | 'OTHER';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export type SessionStatus =
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELED'
  | 'NO_SHOW';

export type ClassFormat = 'PRIVATE_1' | 'SEMI_PRIVATE' | 'GROUP';

export type ClassMode = 'ONLINE' | 'OFFLINE';

export type PaymentStatus =
  | 'UNDER_REVIEW'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'REFUNDED';

export type PaymentMethod = 'BANK_TRANSFER' | 'EWALLET' | 'CASH';

export type PaymentKind = 'SESSION' | 'SUBSCRIPTION' | 'FEATURED_LISTING';

export type PlanTier = 'FREE' | 'PREMIUM_STUDENT' | 'PRO_TUTOR';

export type DiscountType = 'FIXED' | 'PERCENT';

export type PayoutStatus = 'REQUESTED' | 'PAID' | 'REJECTED';
