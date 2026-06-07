import TutorLayoutClient from './_layout-client';

export const dynamic = 'force-dynamic';

export default function TutorLayout({ children }: { children: React.ReactNode }) {
  return <TutorLayoutClient>{children}</TutorLayoutClient>;
}
