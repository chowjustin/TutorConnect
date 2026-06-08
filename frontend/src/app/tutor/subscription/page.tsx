import { CreditCard } from 'lucide-react';

import { PageHeader } from '@/components/ui/page-header';
import { SubscriptionCard } from '@/components/subscription-card';

export default function TutorSubscriptionPage() {
  return (
    <div className='space-y-6'>
      <PageHeader
        icon={CreditCard}
        title='Langganan Pro Tutor'
        description='Komisi lebih rendah, analitik lengkap, dan badge Pro.'
      />
      <div className='max-w-md'>
        <SubscriptionCard
          tier='PRO_TUTOR'
          description='Untuk tutor profesional yang ingin tumbuh lebih cepat.'
          price={100_000}
          perks={[
            'Komisi platform turun 5%',
            'Analitik lengkap dan trend',
            'Badge Pro di profil',
            'Boost prioritas pencarian',
          ]}
        />
      </div>
    </div>
  );
}
