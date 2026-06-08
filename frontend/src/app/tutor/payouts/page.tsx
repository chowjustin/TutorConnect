'use client';

import { useQuery } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PiggyBank } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
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
import { TextField } from '@/components/form/text-field';
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

interface PayoutForm {
  amount: string;
}
const schema = z.object({
  amount: z
    .string()
    .refine(
      (s) => Number(s) >= MIN_PAYOUT_RUPIAH,
      `Minimum ${formatRupiah(MIN_PAYOUT_RUPIAH)}`,
    ),
}) satisfies z.ZodType<PayoutForm>;

export default function PayoutsPage() {
  const request = useRequestPayout();
  const { params } = usePagination();

  const methods = useForm<PayoutForm>({
    resolver: zodResolver(schema),
    defaultValues: { amount: String(MIN_PAYOUT_RUPIAH) },
  });

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

  const onSubmit = methods.handleSubmit((values) => {
    request.mutate(Number(values.amount), {
      onSuccess: () => methods.reset({ amount: String(MIN_PAYOUT_RUPIAH) }),
    });
  });

  const empty = !isLoading && (data?.data.length ?? 0) === 0;

  return (
    <div className='space-y-8'>
      <PageHeader
        icon={PiggyBank}
        title='Pencairan'
        description='Ajukan pencairan saldo dan pantau status pembayaran.'
      />

      <section>
        <h2 className='text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase'>
          Ajukan Pencairan
        </h2>
        <FormProvider {...methods}>
          <form
            onSubmit={onSubmit}
            className='border-primary-100 flex flex-wrap items-center gap-3 rounded-lg border bg-white p-4'
          >
            <div className='flex-1'>
              <TextField<PayoutForm>
                name='amount'
                type='number'
                label='Jumlah (IDR)'
                placeholder={String(MIN_PAYOUT_RUPIAH)}
                className='mono tabular-nums'
                helperText={`Minimum ${formatRupiah(MIN_PAYOUT_RUPIAH)}`}
              />
            </div>
            <Button type='submit' disabled={request.isPending}>
              {request.isPending ? 'Memproses...' : 'Ajukan'}
            </Button>
          </form>
        </FormProvider>
      </section>

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
