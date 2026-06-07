'use client';

import { CheckCircle2, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';

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

  return (
    <Card className='shadow-sm hover:shadow-md hover:shadow-primary-500/5 transition-shadow'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          Status Publikasi
          <StatusBadge kind='verification' status={profile.verificationStatus} />
        </CardTitle>
        <CardDescription>
          {isPublished
            ? 'Profil Anda terlihat di pencarian siswa.'
            : 'Profil Anda belum publik. Lengkapi syarat berikut untuk publish.'}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-3 text-sm'>
        <ul className='space-y-2'>
          <li className='flex items-center gap-2'>
            {verified ? (
              <CheckCircle2 className='size-4 shrink-0 text-emerald-600' />
            ) : (
              <XCircle className='size-4 shrink-0 text-muted-foreground' />
            )}
            Akun terverifikasi oleh admin
          </li>
          <li className='flex items-center gap-2'>
            {reachedScore ? (
              <CheckCircle2 className='size-4 shrink-0 text-emerald-600' />
            ) : (
              <XCircle className='size-4 shrink-0 text-muted-foreground' />
            )}
            Kelengkapan profil minimum {completeness?.minRequired ?? 80}%
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
