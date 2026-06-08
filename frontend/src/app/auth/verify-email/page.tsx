'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, MailQuestion, XCircle } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import withAuth from '@/components/with-auth';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

function VerifyEmailPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get('token') ?? '';
  const [state, setState] = React.useState<
    'idle' | 'pending' | 'done' | 'error'
  >(token ? 'pending' : 'idle');

  React.useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        await api.post('/auth/verify-email', { token });
        setState('done');
        notifySuccess('Email berhasil diverifikasi');
        setTimeout(() => router.replace('/auth/login'), 1500);
      } catch (err) {
        setState('error');
        notifyAxiosError(err, 'Verifikasi gagal');
      }
    })();
  }, [token, router]);

  return (
    <div className='space-y-8'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-semibold tracking-[-0.025em] md:text-4xl'>
          Verifikasi email.
        </h1>
        <p className='text-muted-foreground text-sm'>
          Konfirmasi akun Anda lewat tautan yang dikirim ke email.
        </p>
      </div>

      {state === 'idle' && (
        <div className='flex gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700'>
            <MailQuestion className='size-5' />
          </div>
          <div>
            <p className='text-sm font-semibold text-amber-900'>
              Token tidak ditemukan
            </p>
            <p className='mt-1 text-sm leading-relaxed text-amber-800/80'>
              Buka tautan verifikasi dari email Anda. Jika belum menerima, cek
              folder spam atau minta kirim ulang.
            </p>
          </div>
        </div>
      )}

      {state === 'pending' && (
        <div className='border-primary-100 bg-primary-50/50 flex items-center gap-4 rounded-xl border p-5'>
          <div className='bg-primary-100 text-primary-700 flex size-10 shrink-0 items-center justify-center rounded-lg'>
            <Loader2 className='size-5 animate-spin' />
          </div>
          <div>
            <p className='text-primary-900 text-sm font-semibold'>
              Memverifikasi token...
            </p>
            <p className='text-muted-foreground mt-1 text-sm'>
              Tunggu sebentar.
            </p>
          </div>
        </div>
      )}

      {state === 'done' && (
        <div className='flex gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700'>
            <CheckCircle2 className='size-5' />
          </div>
          <div>
            <p className='text-sm font-semibold text-emerald-900'>
              Email berhasil diverifikasi
            </p>
            <p className='mt-1 text-sm text-emerald-800/80'>
              Mengarahkan Anda ke halaman masuk...
            </p>
          </div>
        </div>
      )}

      {state === 'error' && (
        <div className='space-y-4'>
          <div className='flex gap-4 rounded-xl border border-rose-200 bg-rose-50 p-5'>
            <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700'>
              <XCircle className='size-5' />
            </div>
            <div>
              <p className='text-sm font-semibold text-rose-900'>
                Tautan tidak valid
              </p>
              <p className='mt-1 text-sm text-rose-800/80'>
                Tautan kedaluwarsa atau sudah digunakan. Minta kirim ulang.
              </p>
            </div>
          </div>
          <Button asChild variant='outline' className='w-full'>
            <Link href='/auth/resend-verification'>Kirim ulang tautan</Link>
          </Button>
        </div>
      )}

      <p className='text-muted-foreground text-center text-sm'>
        Sudah verifikasi?{' '}
        <Link
          href='/auth/login'
          className='text-primary-700 hover:text-primary-900 font-medium underline-offset-4 hover:underline'
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}

export default withAuth(VerifyEmailPage, 'optional');
