export const LOCALE = 'id-ID' as const;
export const TIMEZONE = 'Asia/Jakarta' as const;

export const MIN_PAYOUT_RUPIAH = 50_000;
export const PLATFORM_COMMISSION_PCT = 20;
export const FEATURED_PRICE_PER_DAY = 5_000;

export const UPLOAD_MAX_PROOF_MB = 5;
export const UPLOAD_MAX_MATERIAL_MB = 20;

export const ATTENDEE_BOUNDS = {
  PRIVATE_1: { min: 1, max: 1 },
  SEMI_PRIVATE: { min: 2, max: 3 },
  GROUP: { min: 4, max: 20 },
} as const;
