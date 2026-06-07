import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className='from-primary-50 via-white to-primary-100 flex min-h-screen flex-col items-center justify-center bg-gradient-to-br'>
      <div className='space-y-3 text-center'>
        <h1 className='h0 text-primary'>404</h1>
        <p className='text-muted-foreground'>
          Halaman yang Anda cari tidak ditemukan.
        </p>
        <Link href='/'>
          <Button>Kembali ke beranda</Button>
        </Link>
      </div>
    </div>
  );
}
