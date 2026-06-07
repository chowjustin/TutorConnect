'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@/lib/api';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

import type { UpdateAvailabilityRequest } from '../types';

export function useUpdateAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateAvailabilityRequest) => {
      const res = await api.put('/tutors/availability', body);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/tutors/availability'] });
      notifySuccess('Jadwal tersimpan');
    },
    onError: (e) => notifyAxiosError(e),
  });
}
