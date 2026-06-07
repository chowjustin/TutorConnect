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
import { registerStudentFormSchema } from './schema';
import type { RegisterStudentForm } from './types';

function StudentRegisterPage() {
  const router = useRouter();
  const login = useAuthStore.useLogin();
  const { mutateAsync, isPending } = useRegister();

  const methods = useForm<RegisterStudentForm>({
    resolver: zodResolver(registerStudentFormSchema),
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
      role: 'STUDENT',
      whatsappNumber: values.whatsappNumber || undefined,
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
      router.replace('/student');
    } catch (err) {
      notifyAxiosError(err, 'Pendaftaran gagal');
    }
  });

  return (
    <div className='space-y-5'>
      <div className='space-y-1 text-center'>
        <h1 className='h3'>Daftar sebagai Siswa</h1>
        <p className='text-muted-foreground text-sm'>
          Sudah punya akun?{' '}
          <Link href='/auth/login' className='text-primary hover:underline'>
            Masuk
          </Link>
        </p>
      </div>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className='space-y-3.5'>
          <TextField<RegisterStudentForm>
            name='name'
            label='Nama lengkap'
            placeholder='Nama'
          />
          <TextField<RegisterStudentForm>
            name='email'
            label='Email'
            type='email'
            placeholder='you@example.com'
          />
          <div className='grid gap-3 sm:grid-cols-2'>
            <TextField<RegisterStudentForm>
              name='password'
              label='Password'
              type='password'
              placeholder='Min 8 karakter'
            />
            <TextField<RegisterStudentForm>
              name='passwordConfirm'
              label='Konfirmasi password'
              type='password'
            />
          </div>
          <TextField<RegisterStudentForm>
            name='phoneNumber'
            label='Nomor telepon'
            placeholder='08xxxxxxxxxx'
          />
          <TextField<RegisterStudentForm>
            name='whatsappNumber'
            label='WhatsApp (opsional)'
            placeholder='08xxxxxxxxxx'
          />
          <TextField<RegisterStudentForm>
            name='referralCode'
            label='Kode referral (opsional)'
            placeholder='ABC123'
          />
          <Button type='submit' className='w-full' disabled={isPending}>
            {isPending ? 'Memuat...' : 'Daftar'}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}

export default withAuth(StudentRegisterPage, 'public');
