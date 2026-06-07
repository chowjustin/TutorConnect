'use client';

import * as React from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import withAuth, { type WithAuthProps } from '@/components/with-auth';

function TutorRouteLayout({
  children,
  user,
}: { children: React.ReactNode } & Partial<WithAuthProps>) {
  if (!user) return null;
  return (
    <DashboardLayout role='TUTOR' user={user}>
      {children}
    </DashboardLayout>
  );
}

export default withAuth(TutorRouteLayout, 'tutor');
