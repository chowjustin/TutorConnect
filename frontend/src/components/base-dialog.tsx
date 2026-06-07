'use client';

import * as React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import useDialogStore from '@/store/use-dialog-store';

/**
 * Single global dialog mounted in Providers. `useDialog()` opens it from
 * anywhere and resolves to a boolean on close.
 */
export function BaseDialog() {
  const open = useDialogStore.useOpen();
  const options = useDialogStore.useOptions();
  const submit = useDialogStore.useSubmit();
  const cancel = useDialogStore.useCancel();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && cancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{options?.title ?? 'Konfirmasi'}</DialogTitle>
          {options?.description ? (
            <DialogDescription>{options.description}</DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' onClick={cancel}>
            {options?.cancelText ?? 'Batal'}
          </Button>
          <Button
            variant={options?.variant === 'danger' ? 'destructive' : 'default'}
            onClick={submit}
          >
            {options?.submitText ?? 'Lanjut'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
