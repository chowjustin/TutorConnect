'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

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
import { formatDateTimeId, formatRupiah } from '@/lib/format';
import { usePagination } from '@/hooks/use-pagination';
import { apiUrl } from '@/constant/env';
import { getToken } from '@/lib/cookie';
import type { PaginatedApiResponse } from '@/types/api';

import { CalendarDays, Star } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { ReviewDialog } from './components/review-dialog';

import type { SessionItem } from './types';

export default function StudentSessionsPage() {
  const { params } = usePagination();
  const [past, setPast] = React.useState(false);

  const { data, isLoading } = useQuery<{
    data: SessionItem[];
    meta: PaginatedApiResponse<SessionItem[]>['meta'];
  }>({
    queryKey: ['/sessions/student', { ...params, past }],
    queryFn: async () => {
      const res = await api.get('/sessions/student', {
        params: { ...params, past },
      });
      return res.data;
    },
  });

  const downloadIcal = async (id: string) => {
    const token = getToken();
    const res = await fetch(`${apiUrl}/api/sessions/${id}/ical`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const text = await res.text();
    const blob = new Blob([text], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${id}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [reviewTarget, setReviewTarget] = React.useState<{
    tutorId: string;
    tutorName?: string;
  } | null>(null);

  const empty = !isLoading && (data?.data.length ?? 0) === 0;

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={CalendarDays}
        title='Sesi Saya'
        description={past ? 'Riwayat sesi belajar.' : 'Sesi mendatang.'}
        actions={
          <Button variant='outline' size='sm' onClick={() => setPast((p) => !p)}>
            {past ? 'Mendatang' : 'Riwayat'}
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className='h-40 w-full' />
      ) : empty ? (
        <EmptyState
          icon={CalendarDays}
          title={past ? 'Belum ada riwayat sesi' : 'Belum ada sesi terjadwal'}
          description={
            past
              ? 'Sesi yang sudah selesai akan tampil di sini.'
              : 'Pesan sesi dari tutor yang sudah menerima aplikasi Anda.'
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tutor</TableHead>
              <TableHead>Mulai</TableHead>
              <TableHead>Format</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Harga</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.tutor?.user.name ?? '—'}</TableCell>
                <TableCell>{formatDateTimeId(s.startsAt)}</TableCell>
                <TableCell>{s.format}</TableCell>
                <TableCell>
                  <StatusBadge kind='session' status={s.status} />
                </TableCell>
                <TableCell className='mono'>{formatRupiah(s.pricePerSeat)}</TableCell>
                <TableCell>
                  <div className='flex gap-1'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => downloadIcal(s.id)}
                    >
                      iCal
                    </Button>
                    {s.status === 'COMPLETED' ? (
                      <Button
                        size='sm'
                        onClick={() =>
                          setReviewTarget({
                            tutorId: s.tutorId,
                            tutorName: s.tutor?.user.name,
                          })
                        }
                      >
                        <Star className='size-3.5' /> Ulasan
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ReviewDialog
        open={!!reviewTarget}
        onOpenChange={(v) => !v && setReviewTarget(null)}
        tutorId={reviewTarget?.tutorId ?? ''}
        tutorName={reviewTarget?.tutorName}
      />
    </div>
  );
}
