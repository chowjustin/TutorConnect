'use client';

import {
  ArrowUpCircle,
  BadgeCheck,
  Eye,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Benefit {
  icon: LucideIcon;
  title: string;
  body: string;
}

const BENEFITS: Benefit[] = [
  {
    icon: ArrowUpCircle,
    title: 'Tampil paling atas',
    body: 'Profil Anda diprioritaskan di atas tutor non-featured pada hasil pencarian.',
  },
  {
    icon: BadgeCheck,
    title: 'Badge "Featured"',
    body: 'Tag distinct di kartu profil pada hasil pencarian siswa.',
  },
  {
    icon: Eye,
    title: 'Tayangan lebih banyak',
    body: 'Posisi atas berarti lebih banyak siswa melihat profil dan aplikasi masuk.',
  },
  {
    icon: Sparkles,
    title: 'Cocok saat butuh siswa baru',
    body: 'Berguna untuk awal bulan, musim ujian, atau setelah verifikasi tutor.',
  },
];

export function FeaturedBenefits({
  active = false,
}: {
  /** When true, benefits are colored emerald (you have them now). */
  active?: boolean;
}) {
  return (
    <Card>
      <CardContent className='space-y-4'>
        <div>
          <h3 className='text-foreground text-base font-semibold'>
            {active ? 'Manfaat yang Anda dapatkan' : 'Manfaat Featured'}
          </h3>
          <p className='text-muted-foreground text-xs'>
            {active
              ? 'Berlaku selama langganan featured aktif.'
              : 'Ringkasan apa yang Anda dapatkan saat memasang featured.'}
          </p>
        </div>
        <ul className='grid gap-3 sm:grid-cols-2'>
          {BENEFITS.map((b) => (
            <li
              key={b.title}
              className='border-primary-100 flex items-start gap-3 rounded-lg border bg-white p-3'
            >
              <div
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-md border',
                  active
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                    : 'border-primary-100 bg-primary-50 text-primary-600',
                )}
              >
                <b.icon className='size-4' />
              </div>
              <div className='min-w-0'>
                <div className='text-foreground text-sm font-semibold'>
                  {b.title}
                </div>
                <p className='text-muted-foreground text-xs leading-relaxed'>
                  {b.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
