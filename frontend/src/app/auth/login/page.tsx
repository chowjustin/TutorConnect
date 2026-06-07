'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/form/text-field';
import withAuth from '@/components/with-auth';
import useAuthStore from '@/store/use-auth-store';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

import { useLogin } from './hooks/mutation';
import { loginFormSchema } from './schema';
import type { LoginForm, LoginRequest } from './types';

function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const redirect = sp.get('redirect') ?? undefined;
  const login = useAuthStore.useLogin();

  const methods = useForm<LoginForm>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const { mutateAsync, isPending } = useLogin();

  const onSubmit = methods.handleSubmit(async (values) => {
    const req: LoginRequest = {
      email: values.email,
      password: values.password,
    };
    try {
      const res = await mutateAsync(req);
      login({
        ...res.user,
        phoneNumber: '',
        emailVerifiedAt: null,
        referralCode: null,
        referredById: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      notifySuccess('Login berhasil');
      const target =
        redirect ??
        (res.user.role === 'TUTOR'
          ? '/tutor'
          : res.user.role === 'STUDENT'
            ? '/student'
            : '/admin');
      router.replace(target);
    } catch (err) {
      notifyAxiosError(err, 'Login gagal');
    }
  });

  return (
    <div className='space-y-5'>
      <div className='space-y-1 text-center'>
        <h1 className='h3'>Masuk</h1>
        <p className='text-muted-foreground text-sm'>
          Belum punya akun?{' '}
          <Link href='/auth/register' className='text-primary hover:underline'>
            Daftar
          </Link>
        </p>
      </div>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className='space-y-4'>
          <TextField<LoginForm>
            name='email'
            label='Email'
            type='email'
            autoComplete='email'
            placeholder='you@example.com'
          />
          <TextField<LoginForm>
            name='password'
            label='Password'
            type='password'
            autoComplete='current-password'
            placeholder='••••••••'
          />
          <div className='text-right text-sm'>
            <Link
              href='/auth/forgot'
              className='text-primary hover:underline'
            >
              Lupa password?
            </Link>
          </div>
          <Button type='submit' className='w-full' disabled={isPending}>
            {isPending ? 'Memuat...' : 'Masuk'}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}

export default withAuth(LoginPage, 'public');
