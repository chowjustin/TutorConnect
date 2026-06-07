'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VERIFICATION_STATUS } from '@/lib/status';

import type { CompletenessResponse, TutorProfile } from '../types';
import { usePublish, useUnpublish } from '../hooks/mutation';

interface Props {
  profile: TutorProfile | undefined;
  completeness: CompletenessResponse | undefined;
}

export function PublishGate({ profile, completeness }: Props) {
  const publish = usePublish();
  const unpublish = useUnpublish();

  if (!profile) return null;

  const verified = profile.verificationStatus === 'VERIFIED';
  const reachedScore =
    completeness !== undefined && completeness.score >= completeness.minRequired;
  const isPublished = !!profile.publishedAt;

  const canPublish = verified && reachedScore && !isPublished;

  const v = VERIFICATION_STATUS[profile.verificationStatus];

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          Status Publikasi{' '}
          <Badge className={`${v.className} border-0`}>{v.label}</Badge>
        </CardTitle>
        <CardDescription>
          {isPublished
            ? 'Profil Anda terlihat di pencarian siswa.'
            : 'Profil Anda belum publik. Lengkapi syarat berikut untuk publish.'}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-3 text-sm'>
        <ul className='space-y-1'>
          <li>
            {verified ? '✅' : '⛔'} Akun terverifikasi oleh admin
          </li>
          <li>
            {reachedScore ? '✅' : '⛔'} Kelengkapan profil minimum{' '}
            {completeness?.minRequired ?? 80}%
          </li>
        </ul>
        <div className='flex gap-2 pt-2'>
          {isPublished ? (
            <Button
              variant='outline'
              onClick={() => unpublish.mutate()}
              disabled={unpublish.isPending}
            >
              {unpublish.isPending ? 'Memproses...' : 'Sembunyikan'}
            </Button>
          ) : (
            <Button
              onClick={() => publish.mutate()}
              disabled={!canPublish || publish.isPending}
            >
              {publish.isPending ? 'Memproses...' : 'Publikasikan'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
