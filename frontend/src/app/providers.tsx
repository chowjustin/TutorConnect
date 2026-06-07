'use client';

import * as React from 'react';
import {
  QueryClient,
  QueryClientProvider,
  type QueryFunction,
} from '@tanstack/react-query';
import { Toaster } from 'sonner';

import api from '@/lib/api';
import { BaseDialog } from '@/components/base-dialog';
import { CommandPalette } from '@/components/command-palette';

const defaultQueryFn: QueryFunction = async ({ queryKey }) => {
  const [url, params] = queryKey as [string, Record<string, unknown>?];
  const res = await api.get(url, { params });
  return res.data;
};

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: defaultQueryFn,
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position='top-right' />
      <BaseDialog />
      <CommandPalette />
    </QueryClientProvider>
  );
}
