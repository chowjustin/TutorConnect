'use client';

import { useTutorProfile, useCompleteness } from './hooks/query';
import { TutorProfileFormView } from './form';
import { CompletenessCard } from './components/completeness-card';
import { PublishGate } from './containers/PublishGate';

export default function TutorProfilePage() {
  const profileQ = useTutorProfile();
  const completenessQ = useCompleteness();

  return (
    <div className='grid gap-6 lg:grid-cols-[1fr_320px]'>
      <div className='space-y-4'>
        <h1 className='h2'>Profil Tutor</h1>
        <TutorProfileFormView profile={profileQ.data?.profile} />
      </div>
      <aside className='space-y-4'>
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
