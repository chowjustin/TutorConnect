'use client';

import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import type { User } from '@/types/shared';

interface Options {
  enabled?: boolean;
}

/**
 * GET /users/me. Returns the authenticated user (after envelope unwrap).
 * `enabled: false` by default so withAuth can refetch on demand.
 */
export function useGetUserDetail({ enabled = false }: Options = {}) {
  return useQuery<User>({
    queryKey: ['/users/me'],
    queryFn: async () => {
      const res = await api.get<User>('/users/me');
      return res.data;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
