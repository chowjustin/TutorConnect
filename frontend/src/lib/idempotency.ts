import { v4 as uuidv4 } from 'uuid';

import type { AxiosRequestConfig } from 'axios';

/**
 * Returns an axios config patch with an `Idempotency-Key` header.
 * Pass an existing `key` to reuse on retries; omit to generate a new uuid.
 *
 * Usage:
 *   api.post('/sessions', body, withIdempotency())
 *   api.post('/sessions', body, withIdempotency(key))    // retry
 */
export function withIdempotency(key?: string): AxiosRequestConfig {
  return { headers: { 'Idempotency-Key': key ?? uuidv4() } };
}
