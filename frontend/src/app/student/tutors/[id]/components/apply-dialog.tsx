'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

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

import { useApply } from '../hooks/mutation';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tutorId: string;
  tutorName?: string;
}

const schema = z.object({
  message: z.string().max(500, 'Pesan maks 500 karakter'),
});
type ApplyForm = z.infer<typeof schema>;

export function ApplyDialog({ open, onOpenChange, tutorId, tutorName }: Props) {
  const apply = useApply();

  const methods = useForm<ApplyForm>({
    resolver: zodResolver(schema),
    defaultValues: { message: '' },
  });

  const message = methods.watch('message');

  const onSubmit = methods.handleSubmit((values) => {
    apply.mutate(
      { tutorId, message: values.message || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          methods.reset();
        },
      },
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajukan Belajar</DialogTitle>
          <DialogDescription>
            {tutorName
              ? `Kirim pesan singkat ke ${tutorName}.`
              : 'Kirim pesan singkat ke tutor.'}
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <TextareaField<ApplyForm>
                name='message'
                rows={5}
                placeholder='Jelaskan kebutuhan belajar Anda...'
              />
              <div className='text-muted-foreground text-right text-xs'>
                {message.length}/500
              </div>
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type='submit' disabled={apply.isPending}>
                {apply.isPending ? 'Mengirim...' : 'Kirim Aplikasi'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
