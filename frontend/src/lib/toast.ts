import { toast } from 'sonner';

import type { AxiosError } from 'axios';
import type { ApiError } from '@/types/api';

export function notifySuccess(message: string, description?: string) {
  toast.success(message, { description });
}

export function notifyError(message: string, description?: string) {
  toast.error(message, { description });
}

export function notifyInfo(message: string, description?: string) {
  toast.info(message, { description });
}

/**
 * Convenience wrapper for axios errors. Reads the flattened message from the
 * api response interceptor (always a string post-flattening).
 */
export function notifyAxiosError(
  err: unknown,
  fallback = 'Terjadi kesalahan',
) {
  const e = err as AxiosError<ApiError>;
  const msg = e?.response?.data?.message ?? e?.message ?? fallback;
  toast.error(msg);
}
