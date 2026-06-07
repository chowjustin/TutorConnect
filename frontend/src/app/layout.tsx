import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'DBBConnect — Marketplace tutor dan siswa',
    template: '%s | DBBConnect',
  },
  description:
    'Cari tutor terverifikasi, jadwalkan sesi, dan kelola pembayaran dalam satu platform.',
  applicationName: 'DBBConnect',
  authors: [{ name: 'DBBConnect' }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='id' className={jetbrains.variable}>
      <body className='antialiased'>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
