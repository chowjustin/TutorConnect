import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

import { LOCALE, TIMEZONE } from '@/constant/common';

export function formatRupiah(intRupiah: number | null | undefined): string {
  if (intRupiah === null || intRupiah === undefined) return '—';
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(intRupiah);
}

export function formatDateTimeId(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat(LOCALE, {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: TIMEZONE,
  }).format(d);
}

export function formatDateId(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat(LOCALE, {
    dateStyle: 'medium',
    timeZone: TIMEZONE,
  }).format(d);
}

export function formatTimeId(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat(LOCALE, {
    timeStyle: 'short',
    timeZone: TIMEZONE,
  }).format(d);
}

export function formatRelative(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return formatDistanceToNow(d, { addSuffix: true, locale: id });
}

/**
 * Convert weekly slot startMin / endMin (minutes since midnight) to "HH:mm".
 */
export function minutesToHHmm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
