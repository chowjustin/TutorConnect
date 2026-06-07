'use client';

import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import type {
  CompletenessResponse,
  TutorProfileResponse,
} from '../types';

export function useTutorProfile() {
  return useQuery<TutorProfileResponse>({
    queryKey: ['/tutors/profile'],
    queryFn: async () => {
      const res = await api.get<TutorProfileResponse>('/tutors/profile');
      return res.data;
    },
  });
}

export function useCompleteness() {
  return useQuery<CompletenessResponse>({
    queryKey: ['/tutors/me/completeness'],
    queryFn: async () => {
      const res = await api.get<CompletenessResponse>(
        '/tutors/me/completeness',
      );
      return res.data;
    },
  });
}
