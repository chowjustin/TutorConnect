import type {
  ApplicationStatus,
  PaymentStatus,
  PayoutStatus,
  SessionStatus,
  VerificationStatus,
} from '@/types/shared';

export interface StatusMeta {
  label: string;
  className: string;
}

export const APPLICATION_STATUS: Record<ApplicationStatus, StatusMeta> = {
  PENDING: { label: 'Menunggu', className: 'bg-amber-100 text-amber-800' },
  ACCEPTED: { label: 'Diterima', className: 'bg-emerald-100 text-emerald-800' },
  REJECTED: { label: 'Ditolak', className: 'bg-red-100 text-red-800' },
};

export const SESSION_STATUS: Record<SessionStatus, StatusMeta> = {
  SCHEDULED: { label: 'Terjadwal', className: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Selesai', className: 'bg-emerald-100 text-emerald-800' },
  CANCELED: { label: 'Dibatalkan', className: 'bg-gray-200 text-gray-700' },
  NO_SHOW: { label: 'Tidak Hadir', className: 'bg-red-100 text-red-800' },
};

export const PAYMENT_STATUS: Record<PaymentStatus, StatusMeta> = {
  UNDER_REVIEW: {
    label: 'Diperiksa',
    className: 'bg-amber-100 text-amber-800',
  },
  CONFIRMED: { label: 'Diterima', className: 'bg-emerald-100 text-emerald-800' },
  REJECTED: { label: 'Ditolak', className: 'bg-red-100 text-red-800' },
  REFUNDED: { label: 'Dikembalikan', className: 'bg-gray-200 text-gray-700' },
};

export const PAYOUT_STATUS: Record<PayoutStatus, StatusMeta> = {
  REQUESTED: { label: 'Diproses', className: 'bg-amber-100 text-amber-800' },
  PAID: { label: 'Dibayar', className: 'bg-emerald-100 text-emerald-800' },
  REJECTED: { label: 'Ditolak', className: 'bg-red-100 text-red-800' },
};

export const VERIFICATION_STATUS: Record<VerificationStatus, StatusMeta> = {
  PENDING: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
  VERIFIED: { label: 'Verified', className: 'bg-emerald-100 text-emerald-800' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
};
