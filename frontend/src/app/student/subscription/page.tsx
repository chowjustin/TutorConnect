import { CreditCard } from 'lucide-react';

import { PageHeader } from '@/components/ui/page-header';
import { SubscriptionHero } from '@/components/subscription/subscription-hero';
import { PlanCard } from '@/components/subscription/plan-card';
import { SubscriptionHistory } from '@/components/subscription/subscription-history';

export default function StudentSubscriptionPage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        icon={CreditCard}
        title='Langganan'
        description='Tingkatkan akun untuk akses fitur premium.'
      />

      <SubscriptionHero />

      <div className='max-w-md'>
        <PlanCard
          tier='PREMIUM_STUDENT'
          description='Akses materi premium, prioritas booking, dukungan langsung.'
          price={50_000}
          perks={[
            'Akses semua materi premium',
            'Prioritas booking sesi populer',
            'Dukungan via WhatsApp',
            'Diskon 10% untuk sesi pertama',
          ]}
        />
      </div>

      <SubscriptionHistory />
    </div>
  );
}
