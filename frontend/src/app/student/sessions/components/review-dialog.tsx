'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TextareaField } from '@/components/form/textarea-field';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tutorId: string;
  tutorName?: string;
}

const schema = z.object({
  rating: z.number().int().min(1, 'Pilih rating').max(5),
  comment: z.string().max(1000).optional().or(z.literal('')),
});
type ReviewForm = z.infer<typeof schema>;

export function ReviewDialog({
  open,
  onOpenChange,
  tutorId,
  tutorName,
}: Props) {
  const qc = useQueryClient();
  const [hover, setHover] = React.useState(0);

  const methods = useForm<ReviewForm>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0, comment: '' },
  });

  const submit = useMutation({
    mutationFn: async (values: ReviewForm) => {
      const res = await api.post(`/reviews/${tutorId}`, {
        rating: values.rating,
        comment: values.comment || undefined,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [`/reviews/tutor/${tutorId}`] });
      notifySuccess('Ulasan terkirim');
      onOpenChange(false);
      methods.reset();
    },
    onError: (e) => notifyAxiosError(e, 'Gagal mengirim ulasan'),
  });

  const onSubmit = methods.handleSubmit((values) => submit.mutate(values));
  const rating = methods.watch('rating');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Beri Ulasan</DialogTitle>
          <DialogDescription>
            {tutorName
              ? `Bagaimana sesi dengan ${tutorName}?`
              : 'Bagaimana sesi belajar Anda?'}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className='space-y-4'>
            <Controller
              control={methods.control}
              name='rating'
              render={({ field, fieldState }) => (
                <div className='space-y-2'>
                  <div className='flex justify-center gap-1'>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type='button'
                        onMouseEnter={() => setHover(n)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => field.onChange(n)}
                        className='p-1 transition-transform hover:scale-110'
                      >
                        <Star
                          className={cn(
                            'size-10 transition-colors',
                            (hover || field.value) >= n
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-gray-200 text-gray-300',
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  {fieldState.error ? (
                    <p className='text-destructive text-center text-xs'>
                      {fieldState.error.message}
                    </p>
                  ) : null}
                </div>
              )}
            />
            <TextareaField<ReviewForm>
              name='comment'
              rows={4}
              placeholder='Apa yang Anda sukai? Saran perbaikan?'
            />
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type='submit' disabled={rating === 0 || submit.isPending}>
                {submit.isPending ? 'Mengirim...' : 'Kirim Ulasan'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
