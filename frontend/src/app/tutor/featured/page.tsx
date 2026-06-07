'use client';

import * as React from 'react';
import { Sparkles } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { PaymentCheckoutModal } from '@/components/checkout/payment-checkout-modal';
import { formatRupiah } from '@/lib/format';
import { FEATURED_PRICE_PER_DAY } from '@/constant/common';

export default function FeaturedPage() {
  const [days, setDays] = React.useState('7');
  const [open, setOpen] = React.useState(false);
  const n = Number(days) || 0;
  const total = n * FEATURED_PRICE_PER_DAY;

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={Sparkles}
        title='Featured Listing'
        description='Tampil di atas hasil pencarian dengan badge featured.'
      />
      <Card className='max-w-md hover:shadow-md hover:shadow-primary-500/5 transition-shadow'>
        <CardHeader>
          <CardTitle>Pasang Featured</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-1.5'>
            <Label>Durasi (hari)</Label>
            <Input
              type='number'
              min='1'
              max='30'
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
            <p className='text-muted-foreground text-xs'>
              {formatRupiah(FEATURED_PRICE_PER_DAY)}/hari
            </p>
          </div>
          <Card className='from-primary-50 to-primary-100 bg-gradient-to-br border-primary-200'>
            <CardContent className='py-3'>
              <div className='text-muted-foreground text-xs uppercase tracking-wide font-semibold'>
                Total
              </div>
              <div className='mono text-2xl font-bold text-primary-900'>
                {formatRupiah(total)}
              </div>
            </CardContent>
          </Card>
          <Button
            onClick={() => setOpen(true)}
            disabled={n <= 0}
            className='w-full'
            size='lg'
          >
            Lanjut ke Pembayaran
          </Button>
        </CardContent>
      </Card>

      <PaymentCheckoutModal
        open={open}
        onOpenChange={setOpen}
        kind='FEATURED_LISTING'
        title={`Featured ${n} hari`}
        description='Tampil di atas hasil pencarian setelah pembayaran dikonfirmasi.'
        amount={total}
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
