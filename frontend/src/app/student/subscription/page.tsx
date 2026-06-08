import { CreditCard } from 'lucide-react';

import { PageHeader } from '@/components/ui/page-header';
import { SubscriptionCard } from '@/components/subscription-card';

export default function StudentSubscriptionPage() {
  return (
    <div className='space-y-6'>
      <PageHeader
        icon={CreditCard}
        title='Langganan'
        description='Tingkatkan akun untuk akses fitur premium.'
      />
      <div className='max-w-md'>
        <SubscriptionCard
          tier='PREMIUM_STUDENT'
          description='Akses materi premium, prioritas booking, dukungan langsung.'
          price={50_000}
          perks={[
            'Akses semua materi premium',
            'Prioritas booking sesi',
            'Dukungan pelanggan langsung',
            'Diskon 10% untuk sesi pertama',
          ]}
        />
      </div>
    </div>
  );
}
