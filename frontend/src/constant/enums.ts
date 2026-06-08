import type {
  ApplicationStatus,
  ClassFormat,
  ClassMode,
  EducationLevel,
  PaymentKind,
  PaymentMethod,
  PayoutStatus,
  Role,
  SessionStatus,
  Subject,
  TeachingMethod,
  VerificationStatus,
} from '@/types/shared';

export const SUBJECT_OPTIONS: { value: Subject; label: string }[] = [
  { value: 'MATH', label: 'Matematika' },
  { value: 'PHYSICS', label: 'Fisika' },
  { value: 'CHEMISTRY', label: 'Kimia' },
  { value: 'ENGLISH', label: 'Bahasa Inggris' },
  { value: 'COMPUTER_SCIENCE', label: 'Ilmu Komputer' },
  { value: 'ECONOMICS', label: 'Ekonomi' },
  { value: 'ACCOUNTING', label: 'Akuntansi' },
];

export const EDUCATION_LEVEL_OPTIONS: {
  value: EducationLevel;
  label: string;
}[] = [
  { value: 'JUNIOR_HIGH', label: 'SMP' },
  { value: 'SENIOR_HIGH', label: 'SMA' },
  { value: 'UNIVERSITY', label: 'Universitas' },
];

export const TEACHING_METHOD_OPTIONS: {
  value: TeachingMethod;
  label: string;
}[] = [
  { value: 'VISUAL', label: 'Visual' },
  { value: 'DISCUSSION', label: 'Diskusi' },
  { value: 'INTENSIVE', label: 'Intensif' },
  { value: 'STRUCTURED', label: 'Terstruktur' },
];

export const CLASS_FORMAT_OPTIONS: { value: ClassFormat; label: string }[] = [
  { value: 'PRIVATE_1', label: 'Privat — 1 siswa' },
  { value: 'SEMI_PRIVATE', label: 'Semi-Privat — 2 sampai 3 siswa' },
  { value: 'GROUP', label: 'Kelas Grup — 4 sampai 20 siswa' },
];

export const CLASS_MODE_OPTIONS: { value: ClassMode; label: string }[] = [
  { value: 'ONLINE', label: 'Online — via Zoom atau Google Meet' },
  { value: 'OFFLINE', label: 'Offline — lokasi disepakati' },
];

export const PAYMENT_KIND_OPTIONS: { value: PaymentKind; label: string }[] = [
  { value: 'SESSION', label: 'Sesi Belajar' },
  { value: 'SUBSCRIPTION', label: 'Langganan' },
  { value: 'FEATURED_LISTING', label: 'Featured Listing' },
];

export const PAYMENT_METHOD_OPTIONS: {
  value: PaymentMethod;
  label: string;
}[] = [
  { value: 'BANK_TRANSFER', label: 'Transfer Bank' },
  { value: 'EWALLET', label: 'E-Wallet' },
  { value: 'CASH', label: 'Tunai' },
];

export const APPLICATION_STATUS_OPTIONS: {
  value: ApplicationStatus;
  label: string;
}[] = [
  { value: 'PENDING', label: 'Menunggu' },
  { value: 'ACCEPTED', label: 'Diterima' },
  { value: 'REJECTED', label: 'Ditolak' },
];

export const SESSION_STATUS_OPTIONS: {
  value: SessionStatus;
  label: string;
}[] = [
  { value: 'SCHEDULED', label: 'Terjadwal' },
  { value: 'COMPLETED', label: 'Selesai' },
  { value: 'CANCELED', label: 'Dibatalkan' },
  { value: 'NO_SHOW', label: 'Tidak Hadir' },
];

export const PAYOUT_STATUS_OPTIONS: {
  value: PayoutStatus;
  label: string;
}[] = [
  { value: 'REQUESTED', label: 'Diajukan' },
  { value: 'PAID', label: 'Dibayar' },
  { value: 'REJECTED', label: 'Ditolak' },
];

export const VERIFICATION_STATUS_OPTIONS: {
  value: VerificationStatus;
  label: string;
}[] = [
  { value: 'PENDING', label: 'Menunggu Tinjauan' },
  { value: 'VERIFIED', label: 'Terverifikasi' },
  { value: 'REJECTED', label: 'Ditolak' },
];

export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'STUDENT', label: 'Siswa' },
  { value: 'TUTOR', label: 'Tutor' },
  { value: 'ADMIN', label: 'Admin' },
];

// -------- Lookup maps + helpers --------

function toMap<V extends string>(
  opts: { value: V; label: string }[],
): Record<V, string> {
  return opts.reduce(
    (acc, { value, label }) => {
      acc[value] = label;
      return acc;
    },
    {} as Record<V, string>,
  );
}

const SUBJECT_MAP = toMap(SUBJECT_OPTIONS);
const EDUCATION_LEVEL_MAP = toMap(EDUCATION_LEVEL_OPTIONS);
const TEACHING_METHOD_MAP = toMap(TEACHING_METHOD_OPTIONS);
const CLASS_FORMAT_MAP = toMap(CLASS_FORMAT_OPTIONS);
const CLASS_MODE_MAP = toMap(CLASS_MODE_OPTIONS);
const PAYMENT_KIND_MAP = toMap(PAYMENT_KIND_OPTIONS);
const PAYMENT_METHOD_MAP = toMap(PAYMENT_METHOD_OPTIONS);
const APPLICATION_STATUS_MAP = toMap(APPLICATION_STATUS_OPTIONS);
const SESSION_STATUS_MAP = toMap(SESSION_STATUS_OPTIONS);
const PAYOUT_STATUS_MAP = toMap(PAYOUT_STATUS_OPTIONS);
const VERIFICATION_STATUS_MAP = toMap(VERIFICATION_STATUS_OPTIONS);
const ROLE_MAP = toMap(ROLE_OPTIONS);

/** Enum value → Indonesian label. Falls back to raw value if unknown. */
export function subjectLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return SUBJECT_MAP[value as Subject] ?? value;
}

export function educationLevelLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return EDUCATION_LEVEL_MAP[value as EducationLevel] ?? value;
}

export function teachingMethodLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return TEACHING_METHOD_MAP[value as TeachingMethod] ?? value;
}

export function classFormatLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return CLASS_FORMAT_MAP[value as ClassFormat] ?? value;
}

export function classModeLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return CLASS_MODE_MAP[value as ClassMode] ?? value;
}

export function paymentKindLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return PAYMENT_KIND_MAP[value as PaymentKind] ?? value;
}

export function paymentMethodLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return PAYMENT_METHOD_MAP[value as PaymentMethod] ?? value;
}

export function applicationStatusLabel(
  value: string | null | undefined,
): string {
  if (!value) return '—';
  return APPLICATION_STATUS_MAP[value as ApplicationStatus] ?? value;
}

export function sessionStatusLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return SESSION_STATUS_MAP[value as SessionStatus] ?? value;
}

export function payoutStatusLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return PAYOUT_STATUS_MAP[value as PayoutStatus] ?? value;
}

export function verificationStatusLabel(
  value: string | null | undefined,
): string {
  if (!value) return '—';
  return VERIFICATION_STATUS_MAP[value as VerificationStatus] ?? value;
}

export function roleLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return ROLE_MAP[value as Role] ?? value;
}

const LEDGER_REASON_MAP: Record<string, string> = {
  PAYMENT_CONFIRMED: 'Pembayaran dikonfirmasi',
  PAYOUT_REQUESTED: 'Pencairan diajukan',
  PAYOUT_PAID: 'Pencairan dibayar',
  PAYOUT_REJECTED: 'Pencairan ditolak',
};

export function ledgerReasonLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return LEDGER_REASON_MAP[value] ?? value;
}

/** Map an array of enum values to labels. */
export const subjectLabels = (vs: string[]): string[] => vs.map(subjectLabel);
export const educationLevelLabels = (vs: string[]): string[] =>
  vs.map(educationLevelLabel);
export const teachingMethodLabels = (vs: string[]): string[] =>
  vs.map(teachingMethodLabel);
