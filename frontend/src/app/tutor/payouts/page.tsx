'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PiggyBank } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDateTimeId, formatRupiah } from '@/lib/format';
import { usePagination } from '@/hooks/use-pagination';
import { MIN_PAYOUT_RUPIAH } from '@/constant/common';
import type { PaginatedApiResponse } from '@/types/api';
import type { PayoutStatus } from '@/types/shared';

import { useRequestPayout } from './hooks/mutation';

interface PayoutItem {
  id: string;
  amount: number;
  status: PayoutStatus;
  requestedAt: string;
  paidAt: string | null;
}

export default function PayoutsPage() {
  const [amount, setAmount] = React.useState('');
  const request = useRequestPayout();
  const { params } = usePagination();

  const { data, isLoading } = useQuery<{
    data: PayoutItem[];
    meta: PaginatedApiResponse<PayoutItem[]>['meta'];
  }>({
    queryKey: ['/tutor/payouts', params],
    queryFn: async () => {
      const res = await api.get('/tutor/payouts', { params });
      return res.data;
    },
  });

  const onSubmit = () => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n < MIN_PAYOUT_RUPIAH) {
      return alert(`Minimum ${formatRupiah(MIN_PAYOUT_RUPIAH)}`);
    }
    request.mutate(n);
  };

  const empty = !isLoading && (data?.data.length ?? 0) === 0;

  return (
    <div className='space-y-8'>
      <PageHeader
        icon={PiggyBank}
        title='Pencairan'
        description='Ajukan pencairan saldo dan pantau status pembayaran.'
      />

      {/* Inline request form, no Card */}
      <section>
        <h2 className='text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase'>
          Ajukan Pencairan
        </h2>
        <div className='border-primary-100 flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4'>
          <div className='flex-1 space-y-1.5'>
            <Label htmlFor='payout-amount'>Jumlah (IDR)</Label>
            <Input
              id='payout-amount'
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
              placeholder={String(MIN_PAYOUT_RUPIAH)}
              className='mono tabular-nums'
            />
            <p className='text-muted-foreground text-xs'>
              Minimum {formatRupiah(MIN_PAYOUT_RUPIAH)}
            </p>
          </div>
          <Button onClick={onSubmit} disabled={request.isPending}>
            {request.isPending ? 'Memproses...' : 'Ajukan'}
          </Button>
        </div>
      </section>

      {/* History table, no Card */}
      <section>
        <h2 className='text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase'>
          Riwayat
        </h2>
        {isLoading ? (
          <Skeleton className='h-40 w-full' />
        ) : empty ? (
          <EmptyState
            icon={PiggyBank}
            title='Belum ada pencairan'
            description='Pencairan yang Anda ajukan akan tampil di sini.'
          />
        ) : (
          <div className='border-primary-100 overflow-hidden rounded-lg border bg-white'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className='text-right'>Jumlah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dibayar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className='mono text-muted-foreground text-xs tabular-nums'>
                      {formatDateTimeId(p.requestedAt)}
                    </TableCell>
                    <TableCell className='mono text-right tabular-nums'>
                      {formatRupiah(p.amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge kind='payout' status={p.status} />
                    </TableCell>
                    <TableCell className='mono text-muted-foreground text-xs tabular-nums'>
                      {p.paidAt ? formatDateTimeId(p.paidAt) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
