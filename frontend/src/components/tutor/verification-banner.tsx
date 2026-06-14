'use client';

import Link from 'next/link';
import { AlertTriangle, Clock, ShieldCheck } from 'lucide-react';

import { useTutorProfile } from '@/app/tutor/profile/hooks/query';
import { Button } from '@/components/ui/button';

export function VerificationBanner() {
  const { data } = useTutorProfile();
  const status = data?.profile?.verificationStatus;
  if (!status || status === 'VERIFIED') return null;

  const config =
    status === 'REJECTED'
      ? {
          icon: AlertTriangle,
          title: 'Verifikasi ditolak',
          desc: 'Periksa catatan admin lalu unggah ulang dokumen Anda.',
          cta: 'Kirim Ulang',
          tone: 'border-red-200 bg-red-50 text-red-900',
          iconTone: 'text-red-600',
          btn: 'bg-red-600 hover:bg-red-700 text-white',
        }
      : status === 'PENDING' && data?.profile?.idDocumentUrl
        ? {
            icon: Clock,
            title: 'Sedang ditinjau',
            desc: 'Dokumen Anda menunggu persetujuan admin. Anda akan dinotifikasi.',
            cta: 'Lihat Status',
            tone: 'border-amber-200 bg-amber-50 text-amber-900',
            iconTone: 'text-amber-600',
            btn: 'bg-amber-600 hover:bg-amber-700 text-white',
          }
        : {
            icon: ShieldCheck,
            title: 'Verifikasi akun Anda',
            desc: 'Unggah KTP dan bukti pendidikan agar profil dapat dipublish.',
            cta: 'Mulai Verifikasi',
            tone: 'border-primary-200 bg-primary-50 text-primary-900',
            iconTone: 'text-primary-600',
            btn: 'bg-primary-600 hover:bg-primary-700 text-white',
          };

  const Icon = config.icon;

  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between ${config.tone}`}
    >
      <div className='flex items-start gap-3'>
        <Icon className={`mt-0.5 size-5 shrink-0 ${config.iconTone}`} />
        <div>
          <div className='text-sm font-semibold'>{config.title}</div>
          <p className='text-xs opacity-90'>{config.desc}</p>
        </div>
      </div>
      <Button asChild size='sm' className={config.btn}>
        <Link href='/tutor/verification'>{config.cta}</Link>
      </Button>
    </div>
  );
}
