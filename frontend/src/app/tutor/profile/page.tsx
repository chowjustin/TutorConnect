'use client';

import Link from 'next/link';
import { ShieldCheck, ShieldAlert, Clock, ChevronRight } from 'lucide-react';

import { useTutorProfile, useCompleteness } from './hooks/query';
import { TutorProfileFormView } from './form';
import { CompletenessCard } from './components/completeness-card';
import { SectionToc } from './components/section-toc';
import { PublishGate } from './containers/PublishGate';

function VerificationStatusRow({
  status,
}: {
  status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
}) {
  if (!status) return null;
  const cfg =
    status === 'VERIFIED'
      ? {
          Icon: ShieldCheck,
          label: 'Terverifikasi',
          desc: 'Akun Anda telah diverifikasi admin.',
          tone: 'border-emerald-200 bg-emerald-50 text-emerald-900',
          iconTone: 'text-emerald-600',
        }
      : status === 'REJECTED'
        ? {
            Icon: ShieldAlert,
            label: 'Ditolak',
            desc: 'Perbarui dokumen dan kirim ulang.',
            tone: 'border-red-200 bg-red-50 text-red-900',
            iconTone: 'text-red-600',
          }
        : {
            Icon: Clock,
            label: 'Menunggu / Belum dikirim',
            desc: 'Lengkapi dokumen verifikasi untuk publish.',
            tone: 'border-amber-200 bg-amber-50 text-amber-900',
            iconTone: 'text-amber-600',
          };
  const { Icon } = cfg;
  return (
    <Link
      href='/tutor/verification'
      className={`mb-6 flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:brightness-95 ${cfg.tone}`}
    >
      <div className='flex items-center gap-3'>
        <Icon className={`size-5 shrink-0 ${cfg.iconTone}`} />
        <div>
          <div className='text-sm font-semibold'>Verifikasi: {cfg.label}</div>
          <p className='text-xs opacity-80'>{cfg.desc}</p>
        </div>
      </div>
      <ChevronRight className='size-4 opacity-60' />
    </Link>
  );
}

const SECTIONS = [
  { id: 'identitas', label: 'Identitas' },
  { id: 'pengajaran', label: 'Pengajaran' },
  { id: 'bank', label: 'Rekening Bank' },
];

export default function TutorProfilePage() {
  const profileQ = useTutorProfile();
  const completenessQ = useCompleteness();

  return (
    <div className='border-primary-100 -mx-4 grid border-y bg-white md:mx-0 md:grid-cols-[200px_1fr_300px] md:rounded-lg md:border'>
      {/* Sticky section nav (desktop) */}
      <aside className='border-primary-100 hidden p-6 md:sticky md:top-20 md:block md:h-fit md:border-r'>
        <SectionToc sections={SECTIONS} />
      </aside>

      {/* Form */}
      <main className='p-6 md:p-10'>
        <div className='mb-8'>
          <h1 className='text-4xl font-semibold tracking-[-0.025em]'>
            Profil Tutor
          </h1>
          <p className='text-muted-foreground mt-1.5 text-base'>
            Lengkapi profil agar bisa dipublikasikan dan ditemukan siswa.
          </p>
        </div>
        <VerificationStatusRow
          status={profileQ.data?.profile?.verificationStatus}
        />
        <TutorProfileFormView profile={profileQ.data?.profile} />
      </main>

      {/* Completeness + publish gate */}
      <aside className='bg-primary-50/30 border-primary-100 border-t p-6 md:sticky md:top-20 md:h-fit md:border-t-0 md:border-l md:p-8'>
        <CompletenessCard
          data={completenessQ.data}
          isLoading={completenessQ.isLoading}
        />
        <PublishGate
          profile={profileQ.data?.profile}
          completeness={completenessQ.data}
        />
      </aside>
    </div>
  );
}
