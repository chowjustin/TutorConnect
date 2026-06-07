'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '@/lib/api';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

import type { UpdateTutorRequest } from '../types';

export function useUpdateTutorProfile(tutorProfileId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UpdateTutorRequest) => {
      if (!tutorProfileId) throw new Error('No profile');
      const res = await api.patch(`/tutors/${tutorProfileId}`, body);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/tutors/profile'] });
      qc.invalidateQueries({ queryKey: ['/tutors/me/completeness'] });
      notifySuccess('Profil tersimpan');
    },
    onError: (e) => notifyAxiosError(e, 'Gagal menyimpan profil'),
  });
}

export function usePublish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post('/tutors/publish');
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/tutors/profile'] });
      notifySuccess('Profil dipublikasikan');
    },
    onError: (e) => notifyAxiosError(e, 'Gagal publish'),
  });
}

export function useUnpublish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post('/tutors/unpublish');
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/tutors/profile'] });
      notifySuccess('Profil disembunyikan');
    },
    onError: (e) => notifyAxiosError(e),
  });
}
