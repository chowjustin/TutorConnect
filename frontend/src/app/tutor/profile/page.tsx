'use client';

import { useTutorProfile, useCompleteness } from './hooks/query';
import { TutorProfileFormView } from './form';
import { CompletenessCard } from './components/completeness-card';
import { SectionToc } from './components/section-toc';
import { PublishGate } from './containers/PublishGate';

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
