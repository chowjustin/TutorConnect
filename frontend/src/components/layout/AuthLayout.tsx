import * as React from 'react';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className='from-primary-50 via-background to-primary-100 flex min-h-screen flex-col bg-gradient-to-br'>
      <header className='layout py-6'>
        <Link href='/' className='inline-flex items-center gap-2 text-lg font-bold'>
          <GraduationCap className='text-primary size-6' />
          DBBConnect
        </Link>
      </header>
      <main className='flex flex-1 items-center justify-center px-4 py-8'>
        <div className='w-full max-w-md space-y-6 rounded-lg border bg-white p-6 shadow-sm'>
          {title ? (
            <div className='space-y-1 text-center'>
              <h1 className='h3'>{title}</h1>
              {subtitle ? (
                <p className='text-muted-foreground text-sm'>{subtitle}</p>
              ) : null}
            </div>
          ) : null}
          {children}
        </div>
      </main>
      <footer className='layout text-muted-foreground py-6 text-center text-xs'>
        © {new Date().getFullYear()} DBBConnect
      </footer>
    </div>
  );
}
