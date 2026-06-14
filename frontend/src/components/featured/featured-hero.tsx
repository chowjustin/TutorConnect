'use client';

import { useQuery } from '@tanstack/react-query';
import { differenceInDays, format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlertCircle, Clock, Sparkles, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface FeaturedMe {
  id: string;
  tutorId: string;
  activeUntil: string;
}

interface PendingPayment {
  id: string;
  createdAt: string;
}

export function FeaturedHero() {
  const meQ = useQuery<FeaturedMe | null>({ queryKey: ['/featured/me'] });
  const pendingQ = useQuery<{ pending: PendingPayment | null }>({
    queryKey: ['/featured/pending'],
  });

  if (meQ.isLoading) return <Skeleton className='h-32 w-full rounded-2xl' />;

  const listing = meQ.data;
  const expiresAt = listing?.activeUntil ? new Date(listing.activeUntil) : null;
  const isActive = !!expiresAt && expiresAt > new Date();
  const daysLeft =
    isActive && expiresAt ? differenceInDays(expiresAt, new Date()) : null;
  const expiringSoon = daysLeft !== null && daysLeft <= 7;
  const pending = pendingQ.data?.pending;

  return (
    <div className='space-y-3'>
      <article
        className={`relative overflow-hidden rounded-2xl border p-5 md:p-6 ${
          isActive
            ? 'border-secondary-200 from-secondary-50 via-primary-50/40 to-primary-50/30 bg-gradient-to-br'
            : 'border-primary-100 bg-white'
        }`}
      >
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div className='min-w-0'>
            <div className='text-muted-foreground mb-1 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase'>
              {isActive ? (
                <ShieldCheck className='size-3.5 text-emerald-600' />
              ) : (
                <Sparkles className='text-primary-600 size-3.5' />
              )}
              Status featured
            </div>
            <h2 className='text-foreground text-2xl font-semibold tracking-tight md:text-3xl'>
              {isActive ? 'Tampil di pencarian' : 'Tidak featured'}
            </h2>
            <p className='text-muted-foreground mt-1 text-sm'>
              {isActive && expiresAt
                ? `Aktif sampai ${format(expiresAt, 'd MMMM yyyy', { locale: id })}`
                : 'Pasang featured agar profil Anda muncul di atas hasil pencarian.'}
            </p>
          </div>
          {isActive ? (
            <Badge
              variant='secondary'
              className='border border-emerald-200 bg-emerald-50 text-emerald-700'
            >
              Aktif
            </Badge>
          ) : (
            <Badge
              variant='secondary'
              className='border border-slate-200 bg-slate-50 text-slate-700'
            >
              Tidak aktif
            </Badge>
          )}
        </div>

        {isActive && daysLeft !== null ? (
          <div className='mt-5'>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                expiringSoon
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : 'border-primary-200 bg-primary-50 text-primary-800'
              }`}
            >
              {expiringSoon ? (
                <AlertCircle className='size-3.5' />
              ) : (
                <Clock className='size-3.5' />
              )}
              <span className='mono tabular-nums'>{daysLeft}</span>
              hari tersisa
              {expiringSoon ? ' · perpanjang segera' : ''}
            </span>
          </div>
        ) : null}
      </article>

      {pending ? (
        <div className='border-primary-200 bg-primary-50/60 flex items-start gap-3 rounded-lg border p-4'>
          <Clock className='text-primary-600 mt-0.5 size-4 shrink-0' />
          <div className='flex-1 text-sm'>
            <div className='text-foreground font-semibold'>
              Pembayaran sedang ditinjau admin
            </div>
            <div className='text-muted-foreground text-xs'>
              Bukti dikirim{' '}
              {format(new Date(pending.createdAt), 'd MMM yyyy, HH:mm', {
                locale: id,
              })}
              . Status featured akan diperbarui setelah dikonfirmasi.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
