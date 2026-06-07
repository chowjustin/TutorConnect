'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import qs from 'query-string';

import type { PaginationQuery } from '@/types/api';

interface UsePaginationOptions {
  defaultPerPage?: number;
  defaultSortDir?: 'asc' | 'desc';
}

/**
 * URL-state pagination. Reads page / per_page / search / sort_by / sort_dir
 * from `?...` and writes back on update. Deep-link safe.
 */
export function usePagination(opts: UsePaginationOptions = {}) {
  const { defaultPerPage = 10, defaultSortDir = 'desc' } = opts;
  const router = useRouter();
  const sp = useSearchParams();

  const params: Required<PaginationQuery> = React.useMemo(
    () => ({
      page: Number(sp.get('page') ?? 1),
      per_page: Number(sp.get('per_page') ?? defaultPerPage),
      disable_pagination: sp.get('disable_pagination') === 'true',
      search: sp.get('search') ?? '',
      sort_by: sp.get('sort_by') ?? '',
      sort_dir:
        (sp.get('sort_dir') as 'asc' | 'desc' | null) ?? defaultSortDir,
    }),
    [sp, defaultPerPage, defaultSortDir],
  );

  const setParams = React.useCallback(
    (next: Partial<PaginationQuery>) => {
      const merged = { ...params, ...next };
      // Drop empty values from URL
      const clean = Object.fromEntries(
        Object.entries(merged).filter(([, v]) => v !== '' && v !== false),
      );
      const query = qs.stringify(clean, { skipEmptyString: true });
      router.replace(`?${query}`, { scroll: false });
    },
    [params, router],
  );

  return { params, setParams };
}
