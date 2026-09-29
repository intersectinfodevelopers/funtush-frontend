'use client';

import PaymentReturn from '@/components/agency/settings/PaymentReturn';

export default function Page() {
  return <PaymentReturn job={{ provider: 'none', message: 'The payment was cancelled or did not go through. You have not been charged.' }} />;
}
