'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Sparkles } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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

  return (
    <>
      <Card
        className={`hover:shadow-md hover:shadow-primary-500/5 transition-shadow ${isPro ? 'border-primary-300 ring-2 ring-primary-100' : ''}`}
      >
        {isPro ? (
          <div className='from-primary-600 to-primary-400 bg-gradient-to-r px-4 py-1 text-center text-xs font-bold uppercase tracking-wider text-white'>
            Paling Populer
          </div>
        ) : null}
        <CardHeader>
          <CardTitle className='flex items-center justify-between gap-2'>
            <span className='inline-flex items-center gap-2'>
              {isPro ? (
                <Sparkles className='text-amber-500 size-5' />
              ) : null}
              {tier === 'PREMIUM_STUDENT' ? 'Premium Siswa' : 'Pro Tutor'}
            </span>
            {active ? (
              <Badge className='bg-emerald-100 text-emerald-700 border border-emerald-200'>
                Aktif
              </Badge>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <div className='mono text-3xl font-bold text-primary-900'>
              {formatRupiah(price)}
            </div>
            <div className='text-muted-foreground text-xs'>per bulan</div>
          </div>
          <p className='text-muted-foreground text-sm'>{description}</p>
          <ul className='space-y-1.5 text-sm'>
            {perks.map((p) => (
              <li key={p} className='flex items-start gap-2'>
                <CheckCircle2 className='text-emerald-600 mt-0.5 size-4 shrink-0' />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          {meQ.isLoading ? (
            <Skeleton className='h-4 w-32' />
          ) : meQ.data?.expiresAt && active ? (
            <p className='text-muted-foreground text-xs'>
              Berakhir {formatDateId(meQ.data.expiresAt)}
            </p>
          ) : null}
          <Button
            onClick={() => setOpen(true)}
            disabled={active}
            className='w-full'
            size='lg'
          >
            {active ? 'Aktif' : 'Berlangganan'}
          </Button>
        </CardContent>
      </Card>

      <PaymentCheckoutModal
        open={open}
        onOpenChange={setOpen}
        kind='SUBSCRIPTION'
        title={
          tier === 'PREMIUM_STUDENT'
            ? 'Berlangganan Premium Siswa'
            : 'Berlangganan Pro Tutor'
        }
        description={`Aktif 30 hari setelah pembayaran dikonfirmasi.`}
        amount={price}
        invalidate={[['/subscription/me']]}
        createIntent={async () => {
          const res = await api.post<{ refId: string; amount: number }>(
            '/subscription/request',
            { tier },
          );
          // Backend may return refId only; fall back to tier + price.
          const d = res.data as { refId?: string; amount?: number };
          return { refId: d.refId ?? tier, amount: d.amount ?? price };
        }}
      />
    </>
  );
}
