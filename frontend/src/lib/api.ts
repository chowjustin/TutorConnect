import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

import { apiUrl } from '@/constant/env';
import {
  clearTokens,
  getRefreshToken,
  getToken,
  setRefreshToken,
  setToken,
} from '@/lib/cookie';
import type { UninterceptedApiError } from '@/types/api';

// ---------------------------------------------------------------------------
// Module augmentation: opt out of envelope unwrapping for binary / iCal routes.
// ---------------------------------------------------------------------------
declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * If true, response body is returned untouched (no envelope unwrap).
     * Use for file streams, iCal, redirects.
     */
    raw?: boolean;
    _retry?: boolean;
  }
}

const BASE = `${apiUrl}/api`;

const api: AxiosInstance = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ---------- Request: bearer token ------------------------------------------
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------- Response: envelope unwrap + error flattening + refresh queue ----
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function flushQueue(token: string | null) {
  for (const cb of pendingQueue) cb(token);
  pendingQueue = [];
}

api.interceptors.response.use(
  (response) => {
    if (response.config.raw) return response;

    // Backend wraps every JSON in { code, message, data, meta? }.
    // Unwrap so callers get T (or { data: T[], meta } for paginated).
    const body = response.data;
    if (
      body &&
      typeof body === 'object' &&
      'data' in body &&
      typeof (body as { code?: unknown }).code === 'number'
    ) {
      if ('meta' in body) {
        // paginated: preserve meta alongside data
        response.data = { data: body.data, meta: body.meta };
      } else {
        response.data = body.data;
      }
    }
    return response;
  },
  async (error: AxiosError<UninterceptedApiError>) => {
    const original = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // Normalize error.response.data.message to a string.
    if (error.response?.data) {
      const raw = error.response.data.message;
      let flat: string;
      if (typeof raw === 'string') {
        flat = raw;
      } else if (Array.isArray(raw)) {
        flat = (raw as string[]).join(', ');
      } else if (raw && typeof raw === 'object') {
        const first = Object.values(raw)[0];
        flat = Array.isArray(first) ? first[0] : String(first);
      } else {
        flat = error.message;
      }
      (error.response.data as { message: string }).message = flat;
    }

    // Refresh-token flow on 401.
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push((token) => {
            if (!token) return reject(error);
            if (original.headers)
              original.headers.Authorization = `Bearer ${token}`;
            resolve(api(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;
      try {
        const refresh = getRefreshToken();
        if (!refresh) throw error;
        const res = await axios.post<{
          code: number;
          message: string;
          data: { access_token: string; refresh_token: string };
        }>(`${BASE}/auth/refresh`, { refreshToken: refresh });
        const { access_token, refresh_token } = res.data.data;
        setToken(access_token);
        setRefreshToken(refresh_token);
        flushQueue(access_token);
        if (original.headers)
          original.headers.Authorization = `Bearer ${access_token}`;
        return api(original);
      } catch (refreshErr) {
        flushQueue(null);
        clearTokens();
        if (typeof window !== 'undefined') {
          const next = encodeURIComponent(
            window.location.pathname + window.location.search,
          );
          window.location.assign(`/auth/login?redirect=${next}`);
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
export { BASE };
