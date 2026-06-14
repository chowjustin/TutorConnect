import { CreditCard } from 'lucide-react';

import { PageHeader } from '@/components/ui/page-header';
import { SubscriptionHero } from '@/components/subscription/subscription-hero';
import { PlanCard } from '@/components/subscription/plan-card';
import { SubscriptionHistory } from '@/components/subscription/subscription-history';

export default function TutorSubscriptionPage() {
  return (
    <div className='space-y-8'>
      <PageHeader
        icon={CreditCard}
        title='Langganan Pro Tutor'
        description='Komisi lebih rendah, analitik lengkap, dan badge Pro.'
      />

      <SubscriptionHero />

      <div className='max-w-md'>
        <PlanCard
          tier='PRO_TUTOR'
          description='Untuk tutor profesional yang ingin tumbuh lebih cepat.'
          price={100_000}
          perks={[
            'Komisi platform turun 5%',
            'Analitik penghasilan dan retensi',
            'Badge Pro di kartu pencarian',
            'Boost prioritas tampilan',
          ]}
        />
      </div>

      <SubscriptionHistory />
    </div>
  );
}
