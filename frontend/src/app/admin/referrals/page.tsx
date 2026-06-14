'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Gift } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { formatDateTimeId, formatRupiah } from '@/lib/format';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

interface RewardRow {
  id: string;
  status: 'PENDING' | 'GRANTED';
  creditAmount: number;
  createdAt: string;
  triggeredByPaymentId: string | null;
  referrer: { id: string; name: string; email: string; role: string } | null;
  referred: { id: string; name: string; email: string; role: string } | null;
}

const ROLE_BADGE: Record<string, string> = {
  ADMIN: 'border-rose-200 bg-rose-50 text-rose-700',
  TUTOR: 'border-primary-200 bg-primary-50 text-primary-800',
  STUDENT: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

export default function AdminReferralsPage() {
  const qc = useQueryClient();
  const [view, setView] = React.useState<'PENDING' | 'GRANTED'>('PENDING');
  const [grantTarget, setGrantTarget] = React.useState<RewardRow | null>(null);

  const { data, isLoading } = useQuery<RewardRow[]>({
    queryKey: ['/admin/referrals', view],
    queryFn: async () => {
      const res = await api.get('/admin/referrals', {
        params: { status: view },
      });
      return res.data;
    },
  });

  const grant = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/admin/referrals/${id}/grant`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/admin/referrals'] });
      notifySuccess('Reward dicairkan');
      setGrantTarget(null);
    },
    onError: (e) => notifyAxiosError(e),
  });

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={Gift}
        title={view === 'PENDING' ? 'Antrian Referral' : 'Riwayat Referral'}
        description={
          view === 'PENDING'
            ? 'Reward menunggu untuk dicairkan ke wallet/credit.'
            : 'Reward yang sudah dicairkan.'
        }
      />

      <Tabs
        value={view}
        onValueChange={(v) => setView(v as 'PENDING' | 'GRANTED')}
      >
        <TabsList>
          <TabsTrigger value='PENDING'>Antrian</TabsTrigger>
          <TabsTrigger value='GRANTED'>Riwayat</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <Skeleton className='h-40 w-full' />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Referrer</TableHead>
              <TableHead>Referred</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data?.length ?? 0) === 0 ? (
              <TableEmpty colSpan={6}>
                {view === 'PENDING'
                  ? 'Belum ada reward yang menunggu.'
                  : 'Belum ada reward yang dicairkan.'}
              </TableEmpty>
            ) : (
              data!.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className='mono text-xs tabular-nums'>
                    {formatDateTimeId(r.createdAt)}
                  </TableCell>
                  <TableCell>
                    <UserCell user={r.referrer} />
                  </TableCell>
                  <TableCell>
                    <UserCell user={r.referred} />
                  </TableCell>
                  <TableCell className='mono tabular-nums'>
                    {formatRupiah(r.creditAmount)}
                  </TableCell>
                  <TableCell>
                    {r.status === 'PENDING' ? (
                      <Badge
                        variant='secondary'
                        className='border border-amber-200 bg-amber-50 text-amber-800'
                      >
                        Pending
                      </Badge>
                    ) : (
                      <Badge
                        variant='secondary'
                        className='border border-emerald-200 bg-emerald-50 text-emerald-800'
                      >
                        Granted
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {r.status === 'PENDING' ? (
                      <Button size='sm' onClick={() => setGrantTarget(r)}>
                        Cairkan
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <ConfirmDialog
        open={!!grantTarget}
        onOpenChange={(v) => !v && setGrantTarget(null)}
        title='Cairkan reward referral?'
        description={
          grantTarget
            ? `${formatRupiah(grantTarget.creditAmount)} akan dikredit ke ${grantTarget.referrer?.name ?? '—'} dan referred user.`
            : ''
        }
        confirmLabel='Cairkan'
        loading={grant.isPending}
        onConfirm={() => {
          if (!grantTarget) return;
          grant.mutate(grantTarget.id);
        }}
      />
    </div>
  );
}

function UserCell({
  user,
}: {
  user: { name: string; email: string; role: string } | null;
}) {
  if (!user) return <span className='text-muted-foreground text-xs'>—</span>;
  return (
    <div>
      <div className='text-sm font-medium'>{user.name}</div>
      <div className='text-muted-foreground text-xs'>{user.email}</div>
      <Badge
        variant='secondary'
        className={`mt-0.5 border text-[10px] ${ROLE_BADGE[user.role] ?? ''}`}
      >
        {user.role}
      </Badge>
    </div>
  );
}
