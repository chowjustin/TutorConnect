'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { differenceInDays } from 'date-fns';
import { CheckCircle2 } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentCheckoutModal } from '@/components/checkout/payment-checkout-modal';
import { formatRupiah } from '@/lib/format';
import type { PlanTier } from '@/types/shared';

interface MeSub {
  tier: PlanTier;
  expiresAt: string | null;
}

interface PendingPayment {
  id: string;
}

interface Props {
  tier: 'PREMIUM_STUDENT' | 'PRO_TUTOR';
  description: string;
  price: number;
  perks: string[];
}

export function PlanCard({ tier, description, price, perks }: Props) {
  const meQ = useQuery<MeSub>({ queryKey: ['/subscription/me'] });
  const pendingQ = useQuery<{ pending: PendingPayment | null }>({
    queryKey: ['/subscription/pending'],
  });
  const [open, setOpen] = React.useState(false);

  const isPro = tier === 'PRO_TUTOR';
  const name = tier === 'PREMIUM_STUDENT' ? 'Premium Siswa' : 'Pro Tutor';
  const active = meQ.data?.tier === tier;
  const expiresAt = meQ.data?.expiresAt ? new Date(meQ.data.expiresAt) : null;
  const daysLeft =
    active && expiresAt ? differenceInDays(expiresAt, new Date()) : null;
  const expiringSoon = daysLeft !== null && daysLeft <= 30 && daysLeft >= 0;
  const expired = active && daysLeft !== null && daysLeft < 0;
  const pending = !!pendingQ.data?.pending;

  let ctaLabel = 'Berlangganan';
  let ctaDisabled = false;
  if (pending) {
    ctaLabel = 'Menunggu konfirmasi';
    ctaDisabled = true;
  } else if (active && !expiringSoon && !expired) {
    ctaLabel = 'Aktif';
    ctaDisabled = true;
  } else if (active && expiringSoon) {
    ctaLabel = 'Perpanjang sekarang';
  }

  return (
    <>
      <article
        className={`relative flex flex-col rounded-2xl border bg-white p-6 sm:p-8 md:p-10 ${
          active
            ? 'border-emerald-300 shadow-md ring-2 ring-emerald-100'
            : isPro
              ? 'border-primary-300 ring-primary-200/50 shadow-primary-500/5 shadow-md ring-2'
              : 'border-primary-100'
        }`}
      >
        {isPro && !active ? (
          <span className='bg-primary-600 text-primary-foreground absolute -top-3 left-8 rounded-full px-3 py-1 text-[10px] font-semibold tracking-wider uppercase'>
            Paling populer
          </span>
        ) : null}
        {active ? (
          <span className='absolute -top-3 left-8 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold tracking-wider text-emerald-700 uppercase'>
            Paket Anda
          </span>
        ) : null}

        <h3 className='text-foreground text-xl font-semibold'>{name}</h3>
        <p className='text-muted-foreground mt-1 text-sm'>{description}</p>

        <div className='mt-6 flex items-baseline gap-1'>
          <span className='mono text-foreground text-3xl font-semibold tabular-nums sm:text-4xl'>
            {formatRupiah(price)}
          </span>
          <span className='text-muted-foreground text-sm'>/bulan</span>
        </div>

        <ul className='mt-6 space-y-2.5 text-sm'>
          {perks.map((p) => (
            <li key={p} className='flex items-start gap-2'>
              <CheckCircle2
                className={`mt-0.5 size-4 shrink-0 ${
                  active ? 'text-emerald-600' : 'text-primary-600'
                }`}
              />
              <span>{p}</span>
            </li>
          ))}
        </ul>

        <div className='mt-auto pt-8'>
          {meQ.isLoading ? (
            <Skeleton className='h-10 w-full' />
          ) : (
            <Button
              onClick={() => setOpen(true)}
              disabled={ctaDisabled}
              className='w-full'
              size='lg'
              variant={ctaDisabled ? 'outline' : 'default'}
            >
              {ctaLabel}
            </Button>
          )}
          {pending ? (
            <p className='text-muted-foreground mt-2 text-center text-xs'>
              Tidak dapat berlangganan baru selagi ada permintaan pending.
            </p>
          ) : null}
        </div>
      </article>

      <PaymentCheckoutModal
        open={open}
        onOpenChange={setOpen}
        kind='SUBSCRIPTION'
        title={
          tier === 'PREMIUM_STUDENT'
            ? 'Berlangganan Premium Siswa'
            : 'Berlangganan Pro Tutor'
        }
        description='Aktif 30 hari setelah pembayaran dikonfirmasi.'
        amount={price}
        previewRefId={tier}
        invalidate={[
          ['/subscription/me'],
          ['/subscription/pending'],
          ['/subscription/history'],
        ]}
        createIntent={async () => {
          const res = await api.post<{ refId: string; amount: number }>(
            '/subscription/request',
            { tier },
          );
          const d = res.data as { refId?: string; amount?: number };
          return { refId: d.refId ?? tier, amount: d.amount ?? price };
        }}
      />
    </>
  );
}
