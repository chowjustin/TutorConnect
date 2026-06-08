'use client';

import * as React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

type Tone = 'default' | 'danger';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
  loading?: boolean;
  /** When provided, render a notes textarea; confirm fires with the notes value. */
  noteLabel?: string;
  notePlaceholder?: string;
  noteRequired?: boolean;
  onConfirm: (note?: string) => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  tone = 'default',
  loading = false,
  noteLabel,
  notePlaceholder,
  noteRequired = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [note, setNote] = React.useState('');

  React.useEffect(() => {
    if (!open) setNote('');
  }, [open]);

  const Icon = tone === 'danger' ? AlertTriangle : CheckCircle2;
  const iconColor =
    tone === 'danger'
      ? 'text-rose-600 bg-rose-50'
      : 'text-emerald-600 bg-emerald-50';

  const handleConfirm = () => {
    if (noteRequired && !note.trim()) return;
    onConfirm(noteLabel ? note.trim() : undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <div className='flex items-start gap-3'>
            <div
              className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${iconColor}`}
            >
              <Icon className='size-5' />
            </div>
            <div className='space-y-1'>
              <DialogTitle>{title}</DialogTitle>
              {description ? (
                <DialogDescription>{description}</DialogDescription>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        {noteLabel ? (
          <div className='space-y-1.5'>
            <Label>
              {noteLabel}
              {noteRequired ? (
                <span className='text-destructive ml-0.5'>*</span>
              ) : null}
            </Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={notePlaceholder}
              rows={3}
            />
          </div>
        ) : null}

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type='button'
            variant={tone === 'danger' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={loading || (noteRequired && !note.trim())}
          >
            {loading ? 'Memproses...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
