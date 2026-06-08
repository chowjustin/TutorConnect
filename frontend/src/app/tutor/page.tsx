'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  CalendarDays,
  ListChecks,
  Star,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import api from '@/lib/api';
import { BentoTile } from '@/components/ui/bento-tile';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTimeId, formatRupiah } from '@/lib/format';
import { classFormatLabel } from '@/constant/enums';
import type { SessionItem } from '@/app/student/sessions/types';
import type { PaginatedApiResponse } from '@/types/api';

interface TutorDashboard {
  earningsThisMonth: number;
  totalEarnings: number;
  pendingApplications: number;
  upcomingSessions: number;
  rating: number;
}

export default function TutorDashboardPage() {
  const { data, isLoading } = useQuery<TutorDashboard>({
    queryKey: ['/dashboards/tutor'],
  });

  const sessionsQ = useQuery<{
    data: SessionItem[];
    meta: PaginatedApiResponse<SessionItem[]>['meta'];
  }>({
    queryKey: ['/sessions/tutor', { page: 1, per_page: 4, past: false }],
    queryFn: async () => {
      const res = await api.get('/sessions/tutor', {
        params: { page: 1, per_page: 4, past: false },
      });
      return res.data;
    },
  });

  return (
    <div className='space-y-8'>
      <header>
        <h1 className='text-4xl font-semibold tracking-[-0.025em]'>
          Dashboard
        </h1>
        <p className='text-muted-foreground mt-1.5 text-base'>
          Ringkasan penghasilan, aplikasi, dan jadwal Anda.
        </p>
      </header>

      <div className='grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5'>
        {/* Big tile: earnings this month */}
        <div className='border-primary-100 from-secondary-50/60 col-span-2 row-span-2 flex flex-col justify-between rounded-2xl border bg-gradient-to-br to-white p-6'>
          <div>
            <div className='flex items-center gap-2'>
              <Wallet className='text-secondary-600 size-4' />
              <p className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
                Penghasilan Bulan Ini
              </p>
            </div>
            {isLoading ? (
              <Skeleton className='mt-5 h-12 w-48' />
            ) : (
              <p className='mono text-foreground mt-5 text-4xl font-semibold tabular-nums md:text-5xl'>
                {formatRupiah(data?.earningsThisMonth ?? 0)}
              </p>
            )}
            <p className='text-muted-foreground mt-3 text-sm'>
              Total seluruh waktu:{' '}
              <span className='mono text-foreground font-medium tabular-nums'>
                {formatRupiah(data?.totalEarnings ?? 0)}
              </span>
            </p>
          </div>
          <Button asChild variant='secondary' size='sm' className='self-start'>
            <Link href='/tutor/payouts'>
              Ajukan pencairan <ArrowRight className='size-3.5' />
            </Link>
          </Button>
        </div>

        <BentoTile
          icon={ListChecks}
          label='Aplikasi Pending'
          value={data?.pendingApplications ?? 0}
          hint='menunggu respons'
          loading={isLoading}
        />

        <BentoTile
          icon={CalendarDays}
          label='Sesi Mendatang'
          value={data?.upcomingSessions ?? 0}
          hint='dalam 30 hari'
          loading={isLoading}
        />

        <BentoTile
          icon={Star}
          tone='primary'
          label='Rating Rata-rata'
          value={data?.rating?.toFixed(1) ?? '—'}
          hint='dari ulasan siswa'
          loading={isLoading}
        />

        <BentoTile
          icon={TrendingUp}
          label='Total Penghasilan'
          value={formatRupiah(data?.totalEarnings ?? 0)}
          hint='seluruh waktu'
          loading={isLoading}
        />
      </div>

      {/* Recent sessions */}
      <section>
        <div className='mb-3 flex items-baseline justify-between'>
          <h2 className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
            Sesi Mendatang
          </h2>
          <Link
            href='/tutor/sessions'
            className='text-primary-700 hover:text-primary-900 text-xs font-medium'
          >
            Semua sesi →
          </Link>
        </div>
        {sessionsQ.isLoading ? (
          <Skeleton className='h-32 w-full' />
        ) : sessionsQ.data?.data.length ? (
          <div className='border-primary-100 divide-primary-100 divide-y rounded-lg border bg-white'>
            {sessionsQ.data.data.map((s) => (
              <div
                key={s.id}
                className='hover:bg-primary-50/40 flex items-center justify-between gap-4 px-5 py-3 transition-colors'
              >
                <div className='min-w-0'>
                  <p className='mono text-foreground text-sm font-medium tabular-nums'>
                    {formatDateTimeId(s.startsAt)}
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    {s.attendees?.length ?? 0} peserta ·{' '}
                    {classFormatLabel(s.format)}
                  </p>
                </div>
              </div>
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
