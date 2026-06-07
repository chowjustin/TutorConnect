'use client';

import { create } from 'zustand';
import { produce } from 'immer';
import { createSelectorHooks } from 'auto-zustand-selectors-hook';

import type { User } from '@/types/shared';

interface AuthState {
  isAuthed: boolean;
  isLoading: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  stopLoading: () => void;
}

const useAuthStoreBase = create<AuthState>((set) => ({
  isAuthed: false,
  isLoading: true,
  user: null,
  login: (user) =>
    set(
      produce<AuthState>((s) => {
        s.isAuthed = true;
        s.user = user;
        s.isLoading = false;
      }),
    ),
  logout: () =>
    set(
      produce<AuthState>((s) => {
        s.isAuthed = false;
        s.user = null;
        s.isLoading = false;
      }),
    ),
  stopLoading: () =>
    set(
      produce<AuthState>((s) => {
        s.isLoading = false;
      }),
    ),
}));

const useAuthStore = createSelectorHooks(useAuthStoreBase);
export default useAuthStore;
