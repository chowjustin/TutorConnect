'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tutorId: string;
  tutorName?: string;
}

export function ReviewDialog({ open, onOpenChange, tutorId, tutorName }: Props) {
  const qc = useQueryClient();
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [comment, setComment] = React.useState('');

  const submit = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/reviews/${tutorId}`, {
        rating,
        comment: comment || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/reviews/tutor/${tutorId}`] });
      notifySuccess('Ulasan terkirim');
      onOpenChange(false);
      setRating(0);
      setComment('');
    },
    onError: (e) => notifyAxiosError(e, 'Gagal mengirim ulasan'),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Beri Ulasan</DialogTitle>
          <DialogDescription>
            {tutorName ? `Bagaimana sesi dengan ${tutorName}?` : 'Bagaimana sesi belajar Anda?'}
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='flex justify-center gap-1'>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type='button'
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                className='p-1 transition-transform hover:scale-110'
              >
                <Star
                  className={cn(
                    'size-10 transition-colors',
                    (hover || rating) >= n
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-gray-200 text-gray-300',
                  )}
                />
              </button>
            ))}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder='Apa yang Anda sukai? Saran perbaikan?'
          />
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            onClick={() => submit.mutate()}
            disabled={rating === 0 || submit.isPending}
          >
            {submit.isPending ? 'Mengirim...' : 'Kirim Ulasan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
