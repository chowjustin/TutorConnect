import type { Metadata } from 'next';

import { AuthLayout } from '@/components/layout/AuthLayout';

export const metadata: Metadata = {
  title: 'Akun',
};

export default function AuthRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayout>{children}</AuthLayout>;
}
