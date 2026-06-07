import { CheckCircle2, Circle } from 'lucide-react';

import { Progress } from '@/components/ui/progress';
import type { CompletenessResponse } from '../types';

interface Props {
  data: CompletenessResponse | undefined;
  isLoading: boolean;
}

const FIELD_LABELS: Record<string, string> = {
  bio: 'Bio',
  educationBackground: 'Latar Belakang Pendidikan',
  teachingMethods: 'Metode Mengajar',
  educationLevels: 'Jenjang yang Diajar',
  subjects: 'Mata Pelajaran',
  hourlyRate: 'Tarif per Jam',
  introVideoUrl: 'Video Perkenalan',
  whatsappNumber: 'Nomor WhatsApp',
  bank: 'Rekening Bank',
  availability: 'Jadwal Ketersediaan',
  verification: 'Verifikasi Admin',
};

function label(key: string): string {
  return FIELD_LABELS[key] ?? key;
}

/**
 * Flat completeness panel. No Card wrapper. Designed to live inside the
 * profile page's right rail aside.
 */
export function CompletenessCard({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <div className='space-y-3'>
        <h3 className='text-sm font-semibold'>Kelengkapan Profil</h3>
        <Progress value={0} />
      </div>
    );
  }

  const ready = data.score >= data.minRequired;

  return (
    <div className='space-y-3'>
      <div className='flex items-baseline justify-between gap-3'>
        <h3 className='text-sm font-semibold'>Kelengkapan Profil</h3>
        <span
          className={`mono text-2xl font-semibold tabular-nums ${
            ready ? 'text-emerald-600' : 'text-amber-600'
          }`}
        >
          {data.score}%
        </span>
      </div>
      <Progress value={data.score} />
      <p className='text-muted-foreground text-xs'>
        Minimum {data.minRequired}% untuk publikasi.
      </p>
      {data.missing.length ? (
        <div className='space-y-1.5 pt-1'>
          <p className='text-muted-foreground text-[11px] font-medium tracking-wider uppercase'>
            Belum lengkap
          </p>
          <ul className='space-y-1.5 text-sm'>
            {data.missing.map((item) => (
              <li key={item} className='flex items-center gap-2'>
                <Circle className='text-muted-foreground size-3.5 shrink-0' />
                <span>{label(item)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className='flex items-center gap-2 pt-1 text-sm text-emerald-700'>
          <CheckCircle2 className='size-4' /> Semua kriteria terpenuhi
        </p>
      )}
    </div>
  );
}
