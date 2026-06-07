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
    <div className='space-y-5'>
      <div className='space-y-1 text-center'>
        <h1 className='h3'>Lupa Password</h1>
        <p className='text-muted-foreground text-sm'>
          Masukkan email Anda untuk menerima tautan reset.
        </p>
      </div>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className='space-y-4'>
          <TextField<ForgotForm>
            name='email'
            label='Email'
            type='email'
            placeholder='you@example.com'
          />
          <Button type='submit' className='w-full' disabled={isPending}>
            {isPending ? 'Mengirim...' : 'Kirim tautan'}
          </Button>
        </form>
      </FormProvider>
      <p className='text-muted-foreground text-center text-sm'>
        <Link href='/auth/login' className='text-primary hover:underline'>
          Kembali ke login
        </Link>
      </p>
    </div>
  );
}

export default withAuth(ForgotPage, 'public');
