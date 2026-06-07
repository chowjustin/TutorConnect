'use client';

import { useMutation } from '@tanstack/react-query';

import api from '@/lib/api';
import { setRefreshToken, setToken } from '@/lib/cookie';

import type { LoginRequest, LoginResponse } from '../types';

export function useLogin() {
  return useMutation({
    mutationFn: async (body: LoginRequest) => {
      const res = await api.post<LoginResponse>('/auth/login', body);
      return res.data;
    },
    onSuccess: (data) => {
      setToken(data.access_token);
      setRefreshToken(data.refresh_token);
    },
  });
}
