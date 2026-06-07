'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Receipt,
  Sparkles,
} from 'lucide-react';

import api from '@/lib/api';
import { BentoTile } from '@/components/ui/bento-tile';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTimeId } from '@/lib/format';
import type { SessionItem } from '@/app/student/sessions/types';
import type { PaginatedApiResponse } from '@/types/api';

interface StudentDashboard {
  upcomingSessions: number;
  pendingPayments: number;
  materialsCount: number;
  activeSubscription: string | null;
}

export default function StudentDashboardPage() {
  const { data, isLoading } = useQuery<StudentDashboard>({
    queryKey: ['/dashboards/student'],
  });

  const sessionsQ = useQuery<{
    data: SessionItem[];
    meta: PaginatedApiResponse<SessionItem[]>['meta'];
  }>({
    queryKey: ['/sessions/student', { page: 1, per_page: 3, past: false }],
    queryFn: async () => {
      const res = await api.get('/sessions/student', {
        params: { page: 1, per_page: 3, past: false },
      });
      return res.data;
    },
  });

  const nextSession = sessionsQ.data?.data[0];

  return (
    <div className='space-y-8'>
      <header>
        <h1 className='text-4xl font-semibold tracking-[-0.025em]'>
          Dashboard
        </h1>
        <p className='text-muted-foreground mt-1.5 text-base'>
          Pantau sesi, pembayaran, dan materi belajar Anda.
        </p>
      </header>

      <div className='grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5'>
        {/* Big tile: upcoming session preview */}
        <div className='border-primary-100 from-primary-50/50 col-span-2 row-span-2 flex flex-col justify-between rounded-2xl border bg-gradient-to-br to-white p-6'>
          <div>
            <div className='flex items-center gap-2'>
              <CalendarDays className='text-primary-600 size-4' />
              <p className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
                Sesi Mendatang
              </p>
            </div>
            {sessionsQ.isLoading ? (
              <Skeleton className='mt-4 h-20 w-full' />
            ) : nextSession ? (
              <div className='mt-5'>
                <p className='mono text-primary-900 text-2xl font-semibold tabular-nums md:text-3xl'>
                  {formatDateTimeId(nextSession.startsAt)}
                </p>
                <p className='mt-2 text-lg font-medium'>
                  {nextSession.tutor?.user.name ?? '—'}
                </p>
                <p className='text-muted-foreground text-sm'>
                  Format {nextSession.format}
                </p>
              </div>
            ) : (
              <div className='mt-5'>
                <p className='text-foreground text-lg font-medium'>
                  Tidak ada sesi terjadwal
                </p>
                <p className='text-muted-foreground mt-1 text-sm'>
                  Pesan sesi setelah aplikasi diterima tutor.
                </p>
              </div>
            )}
          </div>
          <div className='flex items-center justify-between gap-3 pt-4'>
            <Button asChild variant='outline' size='sm'>
              <Link href='/student/sessions'>
                Semua sesi <ArrowRight className='size-3.5' />
              </Link>
            </Button>
            <Button asChild size='sm'>
              <Link href='/student/tutors'>Cari tutor</Link>
            </Button>
          </div>
        </div>

        <BentoTile
          icon={Receipt}
          tone='secondary'
          label='Pembayaran Pending'
          value={data?.pendingPayments ?? 0}
          hint={data?.pendingPayments ? 'menunggu konfirmasi' : 'semua beres'}
          loading={isLoading}
        />

        <BentoTile
          icon={BookOpen}
          label='Materi Tersedia'
          value={data?.materialsCount ?? 0}
          hint='dari tutor Anda'
          loading={isLoading}
        />

        <BentoTile
          icon={CheckCircle2}
          label='Sesi Mendatang'
          value={data?.upcomingSessions ?? 0}
          hint='dalam 30 hari'
          loading={isLoading}
        />

        <BentoTile
          icon={Sparkles}
          label='Paket Aktif'
          value={data?.activeSubscription ?? 'Free'}
          hint={
            data?.activeSubscription
              ? 'akses penuh'
              : 'upgrade untuk akses penuh'
          }
          loading={isLoading}
        />
      </div>

      {/* Activity wide tile */}
      <section>
        <h2 className='text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase'>
          Sesi 3 Mendatang
        </h2>
        {sessionsQ.isLoading ? (
          <Skeleton className='h-32 w-full' />
        ) : sessionsQ.data?.data.length ? (
          <div className='border-primary-100 divide-primary-100 divide-y rounded-lg border bg-white'>
            {sessionsQ.data.data.map((s) => (
              <Link
                key={s.id}
                href='/student/sessions'
                className='hover:bg-primary-50/40 flex items-center justify-between gap-4 px-5 py-3 transition-colors'
              >
                <div className='min-w-0'>
                  <p className='truncate font-medium'>
                    {s.tutor?.user.name ?? '—'}
                  </p>
                  <p className='mono text-muted-foreground text-xs tabular-nums'>
                    {formatDateTimeId(s.startsAt)}
                  </p>
                </div>
                <span className='text-muted-foreground text-xs'>
                  {s.format}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className='text-muted-foreground text-sm'>
            Belum ada sesi terjadwal.
          </p>
        )}
      </section>
    </div>
  );
}
