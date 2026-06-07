'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import withAuth from '@/components/with-auth';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

function VerifyEmailPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get('token') ?? '';
  const [state, setState] = React.useState<'idle' | 'pending' | 'done' | 'error'>(
    token ? 'pending' : 'idle',
  );

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
    <div className='space-y-4 text-center'>
      <h1 className='h3'>Verifikasi Email</h1>
      {state === 'idle' && (
        <p className='text-muted-foreground text-sm'>
          Buka tautan verifikasi dari email Anda. Token tidak ditemukan di URL.
        </p>
      )}
      {state === 'pending' && (
        <p className='text-muted-foreground text-sm'>Memverifikasi token...</p>
      )}
      {state === 'done' && (
        <p className='text-sm text-emerald-700'>
          Berhasil. Mengarahkan ke halaman login...
        </p>
      )}
      {state === 'error' && (
        <div className='space-y-3'>
          <p className='text-destructive text-sm'>
            Tautan tidak valid atau sudah kedaluwarsa.
          </p>
          <Link href='/auth/resend-verification'>
            <Button variant='outline'>Kirim ulang tautan</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default withAuth(VerifyEmailPage, 'optional');
