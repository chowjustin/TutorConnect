import { CheckCircle2, Circle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { CompletenessResponse } from '../types';

interface Props {
  data: CompletenessResponse | undefined;
  isLoading: boolean;
}

export function CompletenessCard({ data, isLoading }: Props) {
  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kelengkapan Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={0} />
        </CardContent>
      </Card>
    );
  }

  const ready = data.score >= data.minRequired;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center justify-between'>
          <span>Kelengkapan Profil</span>
          <span className={ready ? 'text-emerald-600' : 'text-amber-600'}>
            {data.score}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <Progress value={data.score} />
        <p className='text-muted-foreground text-xs'>
          Minimum {data.minRequired}% untuk publish.
        </p>
        {data.missing.length ? (
          <ul className='space-y-1.5 text-sm'>
            {data.missing.map((item) => (
              <li key={item} className='flex items-center gap-2'>
                <Circle className='text-muted-foreground size-3.5' />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className='flex items-center gap-2 text-sm text-emerald-700'>
            <CheckCircle2 className='size-4' /> Lengkap
          </p>
        )}
      </CardContent>
    </Card>
  );
}
