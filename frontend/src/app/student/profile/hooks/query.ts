'use client';

import { useQuery } from '@tanstack/react-query';

import api from '@/lib/api';
import type { StudentProfileResponse } from '../types';

export function useStudentProfile() {
  return useQuery<StudentProfileResponse>({
    queryKey: ['/students/profile'],
    queryFn: async () => {
      const res = await api.get<StudentProfileResponse>('/students/profile');
      return res.data;
    },
  });
}
