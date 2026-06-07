'use client';

import { create } from 'zustand';
import { produce } from 'immer';
import { createSelectorHooks } from 'auto-zustand-selectors-hook';

export interface DialogOptions {
  title: string;
  description?: string;
  submitText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  catchOnCancel?: boolean;
}

interface DialogState {
  open: boolean;
  options: DialogOptions | null;
  resolve: ((value: boolean) => void) | null;
  reject: ((reason?: unknown) => void) | null;
  show: (opts: DialogOptions) => Promise<boolean>;
  submit: () => void;
  cancel: () => void;
}

const useDialogStoreBase = create<DialogState>((set, get) => ({
  open: false,
  options: null,
  resolve: null,
  reject: null,
  show: (opts) =>
    new Promise<boolean>((resolve, reject) => {
      set(
        produce<DialogState>((s) => {
          s.open = true;
          s.options = opts;
          s.resolve = resolve;
          s.reject = reject;
        }),
      );
    }),
  submit: () => {
    const { resolve } = get();
    resolve?.(true);
    set(
      produce<DialogState>((s) => {
        s.open = false;
        s.options = null;
        s.resolve = null;
        s.reject = null;
      }),
    );
  },
  cancel: () => {
    const { reject, resolve, options } = get();
    if (options?.catchOnCancel) reject?.(new Error('cancelled'));
    else resolve?.(false);
    set(
      produce<DialogState>((s) => {
        s.open = false;
        s.options = null;
        s.resolve = null;
        s.reject = null;
      }),
    );
  },
}));

const useDialogStore = createSelectorHooks(useDialogStoreBase);
export default useDialogStore;
