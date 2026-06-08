'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentCheckoutModal } from '@/components/checkout/payment-checkout-modal';
import { formatDateId, formatRupiah } from '@/lib/format';
import type { PlanTier } from '@/types/shared';

interface MeSub {
  tier: PlanTier;
  expiresAt: string | null;
}

interface Props {
  tier: 'PREMIUM_STUDENT' | 'PRO_TUTOR';
  description: string;
  price: number;
  perks: string[];
}

export function SubscriptionCard({ tier, description, price, perks }: Props) {
  const meQ = useQuery<MeSub>({ queryKey: ['/subscription/me'] });
  const [open, setOpen] = React.useState(false);

  const active = meQ.data?.tier === tier;
  const isPro = tier === 'PRO_TUTOR';
  const name = tier === 'PREMIUM_STUDENT' ? 'Premium Siswa' : 'Pro Tutor';

  return (
    <>
      <article
        className={`relative flex flex-col rounded-2xl p-8 md:p-10 ${
          isPro
            ? 'border-primary-300 ring-primary-200/50 shadow-primary-500/5 border bg-white shadow-md ring-2'
            : 'border-primary-100 border bg-white'
        }`}
      >
        {isPro ? (
          <span className='bg-primary-600 text-primary-foreground absolute -top-3 left-8 rounded-full px-3 py-1 text-[10px] font-semibold tracking-wider uppercase'>
            Paling populer
          </span>
        ) : null}
        {active ? (
          <span className='absolute -top-3 right-8 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-semibold tracking-wider text-emerald-700 uppercase'>
            Aktif
          </span>
        ) : null}

        <h3 className='text-foreground text-xl font-semibold'>{name}</h3>
        <p className='text-muted-foreground mt-1 text-sm'>{description}</p>

        <div className='mt-6 flex items-baseline gap-1'>
          <span className='mono text-foreground text-4xl font-semibold tabular-nums'>
            {formatRupiah(price)}
          </span>
          <span className='text-muted-foreground text-sm'>/bulan</span>
        </div>

        <ul className='mt-6 space-y-2.5 text-sm'>
          {perks.map((p) => (
            <li key={p} className='flex items-start gap-2'>
              <CheckCircle2
                className={`mt-0.5 size-4 shrink-0 ${
                  isPro ? 'text-primary-600' : 'text-emerald-600'
                }`}
              />
              <span>{p}</span>
            </li>
          ))}
        </ul>

        {meQ.isLoading ? (
          <Skeleton className='mt-6 h-4 w-32' />
        ) : meQ.data?.expiresAt && active ? (
          <p className='text-muted-foreground mt-6 text-xs'>
            Berakhir {formatDateId(meQ.data.expiresAt)}
          </p>
        ) : null}

        <div className='mt-auto pt-8'>
          <Button
            onClick={() => setOpen(true)}
            disabled={active}
            className='w-full'
            size='lg'
            variant={isPro ? 'default' : 'outline'}
          >
            {active ? 'Aktif' : 'Berlangganan'}
          </Button>
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
        invalidate={[['/subscription/me']]}
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
