import { apiUrl } from '@/constant/env';

/**
 * Returns an absolute URL for an image/file reference returned by the backend.
 *
 * Prefers `file_url` (already absolute, built per-request) when provided.
 * Falls back to prepending the public uploads path to a bare path.
 */
export function resolveFileUrl(input: string | null | undefined): string {
  if (!input) return '';
  if (/^https?:\/\//i.test(input)) return input;
  const path = input.startsWith('/') ? input.slice(1) : input;
  return `${apiUrl}/uploads/${path}`;
}
