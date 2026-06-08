/** "HH:MM" → minutes since midnight. */
export function hhmmToMinutes(s: string): number {
  const [h, m] = s.split(':').map((v) => parseInt(v, 10) || 0);
  return h * 60 + m;
}

/** Minutes since midnight → "HH:MM" (zero-padded). */
export function minutesToHHmm(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}
