'use client';

import useDialogStore, { type DialogOptions } from '@/store/use-dialog-store';

/**
 * Returns a function that opens the global BaseDialog and resolves with
 * `true` on submit, `false` on cancel (or rejects if `catchOnCancel`).
 *
 *   const dialog = useDialog();
 *   const ok = await dialog({ title: 'Hapus?', variant: 'danger' });
 */
export function useDialog(): (opts: DialogOptions) => Promise<boolean> {
  return useDialogStore.useShow();
}
