'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/form/text-field';
import withAuth from '@/components/with-auth';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';
import useAuthStore from '@/store/use-auth-store';

import { useRegister } from '../hooks/mutation';
import type { RegisterRequest } from '../types';
import { registerTutorFormSchema } from './schema';
import type { RegisterTutorForm } from './types';

function TutorRegisterPage() {
  const router = useRouter();
  const login = useAuthStore.useLogin();
  const { mutateAsync, isPending } = useRegister();

  const methods = useForm<RegisterTutorForm>({
    resolver: zodResolver(registerTutorFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
      phoneNumber: '',
      whatsappNumber: '',
      referralCode: '',
    },
  });

  const onSubmit = methods.handleSubmit(async (values) => {
    const req: RegisterRequest = {
      name: values.name,
      email: values.email,
      password: values.password,
      phoneNumber: values.phoneNumber,
      role: 'TUTOR',
      whatsappNumber: values.whatsappNumber,
      referralCode: values.referralCode || undefined,
    };
    try {
      const res = await mutateAsync(req);
      login({
        ...res.user,
        phoneNumber: req.phoneNumber,
        emailVerifiedAt: null,
        referralCode: null,
        referredById: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      notifySuccess('Pendaftaran berhasil', 'Cek email untuk verifikasi.');
      router.replace('/tutor');
    } catch (err) {
      notifyAxiosError(err, 'Pendaftaran gagal');
    }
  });

  return (
    <div className='space-y-7'>
      <div className='space-y-2'>
        <Link
          href='/auth/register'
          className='text-muted-foreground hover:text-foreground -ml-1 inline-flex items-center gap-1 text-xs'
        >
          ← Ubah peran
        </Link>
        <h1 className='text-3xl font-semibold tracking-[-0.025em] md:text-4xl'>
          Daftar sebagai tutor.
        </h1>
        <p className='text-muted-foreground text-sm'>
          Profil baru ditinjau admin dalam 1×24 jam.{' '}
          <Link
            href='/auth/login'
            className='text-primary-700 hover:text-primary-900 font-medium underline-offset-4 hover:underline'
          >
            Sudah punya akun?
          </Link>
        </p>
      </div>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className='space-y-3.5'>
          <TextField<RegisterTutorForm> name='name' label='Nama lengkap' />
          <TextField<RegisterTutorForm>
            name='email'
            label='Email'
            type='email'
          />
          <div className='grid gap-3 sm:grid-cols-2'>
            <TextField<RegisterTutorForm>
              name='password'
              label='Password'
              type='password'
            />
            <TextField<RegisterTutorForm>
              name='passwordConfirm'
              label='Konfirmasi password'
              type='password'
            />
          </div>
          <TextField<RegisterTutorForm>
            name='phoneNumber'
            label='Nomor telepon'
            placeholder='08xxxxxxxxxx'
          />
          <TextField<RegisterTutorForm>
            name='whatsappNumber'
            label='WhatsApp'
            placeholder='08xxxxxxxxxx'
            helperText='Wajib untuk koordinasi sesi dengan siswa'
          />
          <TextField<RegisterTutorForm>
            name='referralCode'
            label='Kode referral (opsional)'
          />
          <Button
            type='submit'
            size='lg'
            className='w-full'
            disabled={isPending}
          >
            {isPending ? 'Memuat...' : 'Buat akun tutor'}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}

export default withAuth(TutorRegisterPage, 'public');
