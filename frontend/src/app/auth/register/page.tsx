'use client';

import Link from 'next/link';
import { ArrowRight, GraduationCap, UserRound } from 'lucide-react';

import withAuth from '@/components/with-auth';

function RegisterPickerPage() {
  return (
    <div className='space-y-8'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-semibold tracking-[-0.025em] md:text-4xl'>
          Pilih peran Anda.
        </h1>
        <p className='text-muted-foreground text-sm'>
          Pendaftaran gratis. Anda bisa upgrade kapan saja nanti.
        </p>
      </div>

      <div className='space-y-3'>
        <Link
          href='/auth/register/student'
          className='group border-primary-100 hover:border-primary-300 from-primary-50/30 hover:shadow-primary-500/5 relative flex items-start gap-4 overflow-hidden rounded-xl border bg-gradient-to-br to-white p-5 transition-all hover:shadow-md'
        >
          <div className='border-primary-200 bg-primary-100 text-primary-700 flex size-12 shrink-0 items-center justify-center rounded-xl border'>
            <UserRound className='size-5' strokeWidth={2} />
          </div>
          <div className='flex-1'>
            <div className='flex items-baseline gap-2'>
              <span className='text-base font-semibold'>Siswa</span>
              <span className='text-muted-foreground text-xs'>· Gratis</span>
            </div>
            <p className='text-muted-foreground mt-0.5 text-sm leading-relaxed'>
              Cari tutor, ajukan aplikasi, pesan sesi, dan akses materi.
            </p>
          </div>
          <ArrowRight className='text-muted-foreground group-hover:text-primary-700 size-4 self-center transition-colors' />
        </Link>

        <Link
          href='/auth/register/tutor'
          className='group border-primary-100 hover:border-secondary-300 from-secondary-50/40 hover:shadow-secondary-500/5 relative flex items-start gap-4 overflow-hidden rounded-xl border bg-gradient-to-br to-white p-5 transition-all hover:shadow-md'
        >
          <div className='border-secondary-200 bg-secondary-100 text-secondary-700 flex size-12 shrink-0 items-center justify-center rounded-xl border'>
            <GraduationCap className='size-5' strokeWidth={2} />
          </div>
          <div className='flex-1'>
            <div className='flex items-baseline gap-2'>
              <span className='text-base font-semibold'>Tutor</span>
              <span className='text-secondary-700 bg-secondary-100 border-secondary-200 rounded-full border px-1.5 py-0.5 text-[10px] font-medium'>
                Perlu verifikasi
              </span>
            </div>
            <p className='text-muted-foreground mt-0.5 text-sm leading-relaxed'>
              Bagikan keahlian, atur jadwal, dan terima pembayaran transparan.
            </p>
          </div>
          <ArrowRight className='text-muted-foreground group-hover:text-secondary-700 size-4 self-center transition-colors' />
        </Link>
      </div>

      <p className='text-muted-foreground text-center text-sm'>
        Sudah punya akun?{' '}
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

export default withAuth(RegisterPickerPage, 'public');
