import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className='bg-background flex min-h-screen flex-col items-center justify-center gap-3'>
      <Loader2 className='text-primary size-8 animate-spin' />
      <span className='text-muted-foreground text-sm'>Memuat...</span>
    </div>
  );
}
