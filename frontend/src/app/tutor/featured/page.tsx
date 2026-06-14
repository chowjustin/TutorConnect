'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { differenceInDays } from 'date-fns';
import { Sparkles } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { TextField } from '@/components/form/text-field';
import { PaymentCheckoutModal } from '@/components/checkout/payment-checkout-modal';
import { formatRupiah } from '@/lib/format';
import { FEATURED_PRICE_PER_DAY } from '@/constant/common';

import { FeaturedHero } from '@/components/featured/featured-hero';
import { FeaturedBenefits } from '@/components/featured/featured-benefits';
import { FeaturedHistory } from '@/components/featured/featured-history';

interface FeaturedForm {
  days: string;
}

interface FeaturedMe {
  id: string;
  activeUntil: string;
}

interface PendingPayment {
  id: string;
}

const schema = z.object({
  days: z.string().refine((s) => {
    const n = Number(s);
    return Number.isInteger(n) && n >= 1 && n <= 30;
  }, 'Durasi 1–30 hari'),
}) satisfies z.ZodType<FeaturedForm>;

export default function FeaturedPage() {
  const [open, setOpen] = React.useState(false);

  const meQ = useQuery<FeaturedMe | null>({ queryKey: ['/featured/me'] });
  const pendingQ = useQuery<{ pending: PendingPayment | null }>({
    queryKey: ['/featured/pending'],
  });

  const expiresAt = meQ.data?.activeUntil
    ? new Date(meQ.data.activeUntil)
    : null;
  const isActive = !!expiresAt && expiresAt > new Date();
  const daysLeft =
    isActive && expiresAt ? differenceInDays(expiresAt, new Date()) : null;
  const expiringSoon = daysLeft !== null && daysLeft <= 7;
  const pending = !!pendingQ.data?.pending;

  const methods = useForm<FeaturedForm>({
    resolver: zodResolver(schema),
    defaultValues: { days: '7' },
  });

  const days = methods.watch('days');
  const n = Number(days) || 0;
  const total = n * FEATURED_PRICE_PER_DAY;

  const onProceed = methods.handleSubmit(() => setOpen(true));

  let ctaLabel = 'Pasang Featured';
  const ctaDisabled = pending;
  if (pending) {
    ctaLabel = 'Menunggu konfirmasi';
  } else if (isActive && expiringSoon) {
    ctaLabel = 'Perpanjang sekarang';
  } else if (isActive) {
    ctaLabel = 'Tambah durasi';
  }

  return (
    <div className='space-y-8'>
      <PageHeader
        icon={Sparkles}
        title='Featured Listing'
        description='Tampil di atas hasil pencarian dengan badge featured.'
      />

      <FeaturedHero />

      <FeaturedBenefits active={isActive} />

      {pending ? null : (
        <Card className='hover:shadow-primary-500/5 max-w-md transition-shadow hover:shadow-md'>
          <CardHeader>
            <CardTitle>
              {isActive ? 'Perpanjang / Tambah Durasi' : 'Pasang Featured'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FormProvider {...methods}>
              <form onSubmit={onProceed} className='space-y-4'>
                <TextField<FeaturedForm>
                  name='days'
                  type='number'
                  min={1}
                  max={30}
                  label='Durasi (hari)'
                  helperText={`${formatRupiah(FEATURED_PRICE_PER_DAY)}/hari`}
                />
                <Card className='from-primary-50 to-primary-100 border-primary-200 bg-gradient-to-br'>
                  <CardContent className='py-3'>
                    <div className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>
                      Total
                    </div>
                    <div className='mono text-primary-900 text-2xl font-bold'>
                      {formatRupiah(total)}
                    </div>
                  </CardContent>
                </Card>
                <Button
                  type='submit'
                  disabled={ctaDisabled || n <= 0}
                  className='w-full'
                  size='lg'
                >
                  {ctaLabel}
                </Button>
              </form>
            </FormProvider>
          </CardContent>
        </Card>
      )}

      <FeaturedHistory />

      <PaymentCheckoutModal
        open={open}
        onOpenChange={setOpen}
        kind='FEATURED_LISTING'
        title={`Featured ${n} hari`}
        description='Tampil di atas hasil pencarian setelah pembayaran dikonfirmasi.'
        amount={total}
        previewRefId={String(n)}
        invalidate={[
          ['/featured/me'],
          ['/featured/pending'],
          ['/featured/history'],
        ]}
        createIntent={async () => {
          const res = await api.post<{ refId: string; amount: number }>(
            '/featured/request',
            { days: n },
          );
          const d = res.data as { refId?: string; amount?: number };
          return { refId: d.refId ?? String(n), amount: d.amount ?? total };
        }}
      />
    </div>
  );
}
