'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className='from-primary-50 via-white to-primary-100 flex min-h-screen flex-col items-center justify-center bg-gradient-to-br'>
      <div className='space-y-3 text-center'>
        <h1 className='h0 text-destructive'>500</h1>
        <p className='text-muted-foreground'>
          Terjadi kesalahan. Silakan coba lagi.
        </p>
        <Button onClick={reset}>Coba lagi</Button>
      </div>
    </div>
  );
}
