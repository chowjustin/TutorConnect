'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/form/text-field';
import withAuth from '@/components/with-auth';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

interface ResetForm {
  password: string;
  passwordConfirm: string;
}

const schema = z
  .object({
    password: z.string().min(8, 'Password minimal 8 karakter'),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Konfirmasi password tidak cocok',
  }) satisfies z.ZodType<ResetForm>;

function ResetPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get('token') ?? '';

  const methods = useForm<ResetForm>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', passwordConfirm: '' },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (newPassword: string) =>
      api.post('/auth/reset', { token, newPassword }),
  });

  const onSubmit = methods.handleSubmit(async (values) => {
    try {
      await mutateAsync(values.password);
      notifySuccess('Password berhasil direset');
      router.replace('/auth/login');
    } catch (err) {
      notifyAxiosError(err);
    }
  });

  return (
    <div className='space-y-8'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-semibold tracking-[-0.025em] md:text-4xl'>
          Atur password baru.
        </h1>
        <p className='text-muted-foreground text-sm'>
          Pilih password yang kuat. Minimal 8 karakter.
        </p>
      </div>
      {!token ? (
        <div className='rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800'>
          Tautan reset tidak valid. Token tidak ditemukan di URL.
        </div>
      ) : (
        <FormProvider {...methods}>
          <form onSubmit={onSubmit} className='space-y-5'>
            <TextField<ResetForm>
              name='password'
              label='Password baru'
              type='password'
              placeholder='Min 8 karakter'
            />
            <TextField<ResetForm>
              name='passwordConfirm'
              label='Konfirmasi password'
              type='password'
              placeholder='Ulangi password'
            />
            <Button
              type='submit'
              size='lg'
              className='w-full'
              disabled={isPending}
            >
              {isPending ? 'Menyimpan...' : 'Simpan password baru'}
            </Button>
          </form>
        </FormProvider>
      )}
    </div>
  );
}

export default withAuth(ResetPage, 'public');
