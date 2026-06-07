import { showLogger } from '@/constant/env';

/**
 * Drop-in replacement for console.log. Disabled in prod unless
 * NEXT_PUBLIC_SHOW_LOGGER=true. The only file allowed to use console.*.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function logger(value: any, comment?: string) {
  if (!showLogger) return;
  if (comment) {
    // eslint-disable-next-line no-console
    console.log(`[${comment}]`, value);
  } else {
    // eslint-disable-next-line no-console
    console.log(value);
  }
}
