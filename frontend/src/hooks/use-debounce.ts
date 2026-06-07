'use client';

import * as React from 'react';

/**
 * Returns a debounced copy of `value`. Updates after `delay` ms of no change.
 * Useful for search inputs feeding into useQuery keys.
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}
