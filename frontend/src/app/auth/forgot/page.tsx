'use client';

import * as React from 'react';
import Link from 'next/link';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/form/text-field';
import withAuth from '@/components/with-auth';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

interface ForgotForm {
  email: string;
}

const schema = z.object({
  email: z.string().email('Email tidak valid'),
}) satisfies z.ZodType<ForgotForm>;

function ForgotPage() {
  const methods = useForm<ForgotForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (body: ForgotForm) => api.post('/auth/forgot', body),
  });

  const onSubmit = methods.handleSubmit(async (values) => {
    try {
      await mutateAsync(values);
      notifySuccess('Jika email terdaftar, kami akan mengirim tautan reset.');
    } catch (err) {
      notifyAxiosError(err);
    }
  });

  return (
    <div className='space-y-8'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-semibold tracking-[-0.025em] md:text-4xl'>
          Reset password Anda.
        </h1>
        <p className='text-muted-foreground text-sm'>
          Masukkan email akun Anda. Kami akan kirim tautan reset password ke
          inbox.
        </p>
      </div>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className='space-y-5'>
          <TextField<ForgotForm>
            name='email'
            label='Email akun'
            type='email'
            placeholder='you@example.com'
          />
          <Button
            type='submit'
            size='lg'
            className='w-full'
            disabled={isPending}
          >
            {isPending ? 'Mengirim...' : 'Kirim tautan reset'}
          </Button>
        </form>
      </FormProvider>
      <p className='text-muted-foreground text-sm'>
        Ingat password Anda?{' '}
        <Link
          href='/auth/login'
          className='text-primary-700 hover:text-primary-900 font-medium underline-offset-4 hover:underline'
        >
          Kembali ke masuk
        </Link>
      </p>
    </div>
  );
}

export default withAuth(ForgotPage, 'public');
