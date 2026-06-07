'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@/lib/api';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

import type { UpdateStudentRequest } from '../types';

export function useUpdateStudentProfile(profileId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateStudentRequest) => {
      if (!profileId) throw new Error('No profile');
      const res = await api.patch(`/students/${profileId}`, body);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/students/profile'] });
      notifySuccess('Profil tersimpan');
    },
    onError: (e) => notifyAxiosError(e, 'Gagal menyimpan profil'),
  });
}
