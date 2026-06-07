'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarPlus } from 'lucide-react';

import api from '@/lib/api';
import { withIdempotency } from '@/lib/idempotency';
import useAuthStore from '@/store/use-auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/ui/page-header';
import { Stepper } from '@/components/ui/stepper';
import { EmptyState } from '@/components/ui/empty-state';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';
import { formatRupiah } from '@/lib/format';
import type { ClassFormat, ClassMode } from '@/types/shared';

interface ApplicationItem {
  id: string;
  status: string;
  tutorId: string;
  tutor: {
    id: string;
    hourlyRate: number | null;
    user: { id: string; name: string; email: string };
  };
}

interface AvailabilitySlot {
  id: string;
  dayOfWeek: number;
  startMin: number;
  endMin: number;
  timezone: string;
}

const DAYS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
] as const;

function minutesToHHmm(m: number): string {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export default function BookSessionPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const qc = useQueryClient();
  const user = useAuthStore.useUser();
  const studentProfileId = user?.studentProfileId;

  const [step, setStep] = React.useState(0);
  const [tutorId, setTutorId] = React.useState<string>(sp.get('tutor') ?? '');
  const [date, setDate] = React.useState('');
  const [startTime, setStartTime] = React.useState('');
  const [endTime, setEndTime] = React.useState('');
  const [format, setFormat] = React.useState<ClassFormat>('PRIVATE_1');
  const [mode, setMode] = React.useState<ClassMode>('ONLINE');

  // Step 1: list accepted applications -> tutors
  const apps = useQuery<{ data: ApplicationItem[] }>({
    queryKey: ['/applications/student', { per_page: 50 }],
    queryFn: async () => {
      const res = await api.get('/applications/student', {
        params: { per_page: 50 },
      });
      return res.data;
    },
  });

  const acceptedTutors =
    apps.data?.data
      .filter((a) => a.status === 'ACCEPTED')
      .map((a) => a.tutor)
      .filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i) ?? [];

  const selectedTutor = acceptedTutors.find((t) => t.id === tutorId);

  // Step 2: availability for selected tutor
  const avail = useQuery<AvailabilitySlot[]>({
    queryKey: [`/tutors/${tutorId}/availability`],
    enabled: !!tutorId && step >= 1,
  });

  // Book
  const book = useMutation({
    mutationFn: async () => {
      if (!studentProfileId) throw new Error('No student profile');
      if (!selectedTutor) throw new Error('Pilih tutor');
      const startsAt = new Date(`${date}T${startTime}:00`).toISOString();
      const endsAt = new Date(`${date}T${endTime}:00`).toISOString();
      const res = await api.post(
        '/sessions',
        {
          tutorId,
          format,
          mode,
          startsAt,
          endsAt,
          pricePerSeat: selectedTutor.hourlyRate ?? 0,
          attendeeStudentIds: [studentProfileId],
        },
        withIdempotency(),
      );
      return res.data;
    },
    onSuccess: () => {
      notifySuccess('Sesi berhasil dipesan');
      qc.invalidateQueries({ queryKey: ['/sessions/student'] });
      router.push('/student/sessions');
    },
    onError: (e) => notifyAxiosError(e, 'Gagal memesan sesi'),
  });

  const canNext = (() => {
    if (step === 0) return !!tutorId;
    if (step === 1) return !!date && !!startTime && !!endTime && startTime < endTime;
    return true;
  })();

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={CalendarPlus}
        title='Pesan Sesi'
        description='Tiga langkah singkat untuk mengatur sesi belajar.'
      />

      <Stepper steps={['Tutor', 'Jadwal', 'Konfirmasi']} current={step} />

      {step === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Pilih Tutor</CardTitle>
          </CardHeader>
          <CardContent>
            {apps.isLoading ? (
              <Skeleton className='h-32 w-full' />
            ) : acceptedTutors.length === 0 ? (
              <EmptyState
                icon={CalendarPlus}
                title='Belum ada tutor diterima'
                description='Ajukan belajar ke tutor terlebih dahulu lewat halaman Cari Tutor.'
                action={
                  <Button onClick={() => router.push('/student/tutors')}>
                    Cari Tutor
                  </Button>
                }
              />
            ) : (
              <div className='grid gap-3 sm:grid-cols-2'>
                {acceptedTutors.map((t) => {
                  const selected = t.id === tutorId;
                  const initials = t.user.name
                    .split(' ')
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();
                  return (
                    <button
                      key={t.id}
                      type='button'
                      onClick={() => setTutorId(t.id)}
                      className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                        selected
                          ? 'border-primary-400 bg-primary-50 ring-2 ring-primary-200'
                          : 'border-input hover:border-primary-200 hover:bg-primary-50/30'
                      }`}
                    >
                      <Avatar className='size-10 ring-2 ring-primary-100'>
                        <AvatarFallback className='bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-bold text-white'>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className='min-w-0 flex-1'>
                        <div className='font-semibold truncate'>
                          {t.user.name}
                        </div>
                        <div className='text-muted-foreground mono text-xs'>
                          {t.hourlyRate
                            ? `${formatRupiah(t.hourlyRate)}/jam`
                            : 'Tarif belum diatur'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Pilih Jadwal</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {avail.isLoading ? (
              <Skeleton className='h-20 w-full' />
            ) : (
              <div className='bg-primary-50/40 border-primary-100 rounded-lg border p-3'>
                <div className='text-muted-foreground text-xs font-semibold uppercase tracking-wide mb-2'>
                  Ketersediaan Tutor
                </div>
                {(avail.data ?? []).length === 0 ? (
                  <p className='text-muted-foreground text-sm'>
                    Tutor belum mengatur jadwal.
                  </p>
                ) : (
                  <ul className='space-y-1 text-sm'>
                    {(avail.data ?? []).map((s) => (
                      <li
                        key={s.id}
                        className='mono flex items-center justify-between'
                      >
                        <span>{DAYS[s.dayOfWeek]}</span>
                        <span>
                          {minutesToHHmm(s.startMin)} – {minutesToHHmm(s.endMin)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className='space-y-1.5'>
              <Label>Tanggal</Label>
              <Input
                type='date'
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className='grid gap-3 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label>Mulai</Label>
                <Input
                  type='time'
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className='space-y-1.5'>
                <Label>Selesai</Label>
                <Input
                  type='time'
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className='grid gap-3 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label>Format</Label>
                <Select
                  value={format}
                  onValueChange={(v) => setFormat(v as ClassFormat)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='PRIVATE_1'>Privat 1-1</SelectItem>
                    <SelectItem value='SEMI_PRIVATE'>Semi-Privat (2-3)</SelectItem>
                    <SelectItem value='GROUP'>Grup (4-20)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1.5'>
                <Label>Mode</Label>
                <Select
                  value={mode}
                  onValueChange={(v) => setMode(v as ClassMode)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ONLINE'>Online</SelectItem>
                    <SelectItem value='OFFLINE'>Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === 2 ? (
        <Card>
          <CardHeader>
            <CardTitle>Konfirmasi</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3 text-sm'>
            <Row label='Tutor' value={selectedTutor?.user.name ?? '—'} />
            <Row label='Tanggal' value={date} />
            <Row label='Waktu' value={`${startTime} – ${endTime}`} />
            <Row label='Format' value={format} />
            <Row label='Mode' value={mode} />
            <div className='border-primary-200 from-primary-50 to-primary-100 mt-3 rounded-lg border bg-gradient-to-br p-3'>
              <div className='text-muted-foreground text-xs font-semibold uppercase tracking-wide'>
                Total
              </div>
              <div className='mono text-2xl font-bold text-primary-900'>
                {selectedTutor?.hourlyRate
                  ? formatRupiah(selectedTutor.hourlyRate)
                  : '—'}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className='flex justify-between'>
        <Button
          variant='outline'
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Kembali
        </Button>
        {step < 2 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
            Lanjut
          </Button>
        ) : (
          <Button onClick={() => book.mutate()} disabled={book.isPending}>
            {book.isPending ? 'Memesan...' : 'Pesan Sesi'}
          </Button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-center justify-between gap-3 border-b py-1.5 last:border-0'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='font-medium'>{value}</span>
    </div>
  );
}
