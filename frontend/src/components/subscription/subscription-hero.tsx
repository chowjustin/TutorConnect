'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { differenceInDays, format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Sparkles, ShieldCheck, Clock, AlertCircle } from 'lucide-react';

import api from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import type { PlanTier } from '@/types/shared';

interface MeSub {
  tier: PlanTier;
  expiresAt: string | null;
}

interface PendingPayment {
  id: string;
  status: 'UNDER_REVIEW' | 'CONFIRMED' | 'REJECTED' | 'REFUNDED';
  createdAt: string;
  netAmount: number;
}

const TIER_NAME: Record<PlanTier, string> = {
  FREE: 'Gratis',
  PREMIUM_STUDENT: 'Premium Siswa',
  PRO_TUTOR: 'Pro Tutor',
};

export function SubscriptionHero() {
  const meQ = useQuery<MeSub>({ queryKey: ['/subscription/me'] });
  const pendingQ = useQuery<{ pending: PendingPayment | null }>({
    queryKey: ['/subscription/pending'],
  });

  if (meQ.isLoading) return <Skeleton className='h-32 w-full rounded-2xl' />;

  const sub = meQ.data;
  const isActive =
    !!sub &&
    sub.tier !== 'FREE' &&
    sub.expiresAt &&
    new Date(sub.expiresAt) > new Date();
  const daysLeft =
    isActive && sub?.expiresAt
      ? differenceInDays(new Date(sub.expiresAt), new Date())
      : null;
  const expiringSoon = daysLeft !== null && daysLeft <= 30;
  const pending = pendingQ.data?.pending;

  return (
    <div className='space-y-3'>
      <article
        className={`relative overflow-hidden rounded-2xl border p-5 md:p-6 ${
          isActive
            ? 'border-primary-200 from-primary-50 via-primary-50/60 to-secondary-50/40 bg-gradient-to-br'
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
              Status langganan
            </div>
            <h2 className='text-foreground text-2xl font-semibold tracking-tight md:text-3xl'>
              {sub ? TIER_NAME[sub.tier] : 'Gratis'}
            </h2>
            <p className='text-muted-foreground mt-1 text-sm'>
              {isActive && sub?.expiresAt
                ? `Aktif sampai ${format(new Date(sub.expiresAt), 'd MMMM yyyy', { locale: id })}`
                : 'Tidak ada langganan aktif. Berlangganan untuk akses penuh.'}
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
              . Status langganan akan diperbarui setelah dikonfirmasi.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
