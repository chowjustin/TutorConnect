'use client';

import { useMutation } from '@tanstack/react-query';

import api from '@/lib/api';
import { setRefreshToken, setToken } from '@/lib/cookie';

import type { RegisterRequest, RegisterResponse } from '../types';

export function useRegister() {
  return useMutation({
    mutationFn: async (body: RegisterRequest) => {
      const res = await api.post<RegisterResponse>('/auth/register', body);
      return res.data;
    },
    onSuccess: (data) => {
      setToken(data.access_token);
      setRefreshToken(data.refresh_token);
    },
  });
}
