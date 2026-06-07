'use client';

import * as React from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import withAuth, { type WithAuthProps } from '@/components/with-auth';

function AdminRouteLayout({
  children,
  user,
}: { children: React.ReactNode } & Partial<WithAuthProps>) {
  if (!user) return null;
  return (
    <DashboardLayout role='ADMIN' user={user}>
      {children}
    </DashboardLayout>
  );
}

export default withAuth(AdminRouteLayout, 'admin');
