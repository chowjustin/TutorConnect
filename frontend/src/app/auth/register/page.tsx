'use client';

import Link from 'next/link';
import { GraduationCap, UserRound } from 'lucide-react';

import withAuth from '@/components/with-auth';

function RegisterPickerPage() {
  return (
    <div className='space-y-5'>
      <div className='space-y-1 text-center'>
        <h1 className='h3'>Daftar sebagai</h1>
        <p className='text-muted-foreground text-sm'>
          Pilih peran yang sesuai
        </p>
      </div>
      <div className='grid gap-3'>
        <Link
          href='/auth/register/student'
          className='hover:border-primary flex items-center gap-3 rounded-lg border p-4 transition'
        >
          <UserRound className='text-primary size-8 shrink-0' />
          <div>
            <div className='font-semibold'>Siswa</div>
            <div className='text-muted-foreground text-xs'>
              Cari tutor, ikuti sesi, dan akses materi
            </div>
          </div>
        </Link>
        <Link
          href='/auth/register/tutor'
          className='hover:border-primary flex items-center gap-3 rounded-lg border p-4 transition'
        >
          <GraduationCap className='text-primary size-8 shrink-0' />
          <div>
            <div className='font-semibold'>Tutor</div>
            <div className='text-muted-foreground text-xs'>
              Bagikan keahlian, atur jadwal, dan kelola penghasilan
            </div>
          </div>
        </Link>
      </div>
      <p className='text-muted-foreground text-center text-sm'>
        Sudah punya akun?{' '}
        <Link href='/auth/login' className='text-primary hover:underline'>
          Masuk
        </Link>
      </p>
    </div>
  );
}

export default withAuth(RegisterPickerPage, 'public');
