import Link from 'next/link';
import {
  CalendarCheck,
  GraduationCap,
  PiggyBank,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className='flex min-h-screen flex-col bg-white text-foreground'>
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className='border-b'>
      <div className='layout flex items-center justify-between py-4'>
        <Link href='/' className='inline-flex items-center gap-2 text-lg font-bold'>
          <GraduationCap className='text-primary size-6' />
          DBBConnect
        </Link>
        <nav className='flex items-center gap-3'>
          <Link href='/auth/login'>
            <Button variant='ghost' size='sm'>
              Masuk
            </Button>
          </Link>
          <Link href='/auth/register'>
            <Button size='sm'>Daftar</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className='from-primary-50 via-white to-primary-100 bg-gradient-to-br py-16 sm:py-24'>
      <div className='layout grid items-center gap-10 lg:grid-cols-2'>
        <div className='space-y-5'>
          <span className='bg-primary-100 text-primary-700 inline-block rounded-full px-3 py-1 text-xs font-semibold'>
            Marketplace tutor terverifikasi
          </span>
          <h1 className='h0 leading-tight'>
            Belajar lebih dekat dengan{' '}
            <span className='text-primary'>tutor terbaik</span>
          </h1>
          <p className='text-muted-foreground text-base md:text-lg'>
            Cari tutor, pesan sesi, dan kelola pembayaran dalam satu platform
            yang aman dan transparan.
          </p>
          <div className='flex flex-wrap gap-3'>
            <Link href='/auth/register/student'>
              <Button size='lg'>Cari Tutor</Button>
            </Link>
            <Link href='/auth/register/tutor'>
              <Button size='lg' variant='outline'>
                Jadi Tutor
              </Button>
            </Link>
          </div>
        </div>
        <div className='from-primary-200 to-primary-400 relative h-72 rounded-2xl bg-gradient-to-br shadow-lg md:h-96'>
          <div className='absolute inset-6 flex items-center justify-center rounded-xl bg-white/90 backdrop-blur'>
            <GraduationCap className='text-primary size-24' />
          </div>
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: Search,
    title: 'Pencarian cerdas',
    body: 'Filter berdasarkan mapel, level, metode, dan rating.',
  },
  {
    icon: ShieldCheck,
    title: 'Tutor terverifikasi',
    body: 'Setiap tutor diverifikasi oleh admin dengan dokumen lengkap.',
  },
  {
    icon: CalendarCheck,
    title: 'Jadwal fleksibel',
    body: 'Pilih slot sesuai ketersediaan tutor.',
  },
  {
    icon: PiggyBank,
    title: 'Pembayaran aman',
    body: 'Photo-first dengan konfirmasi admin sebelum dana dilepas.',
  },
];

function Features() {
  return (
    <section className='py-16'>
      <div className='layout space-y-8'>
        <div className='text-center'>
          <h2 className='h2'>Kenapa DBBConnect?</h2>
          <p className='text-muted-foreground mt-2 text-sm md:text-base'>
            Platform yang dirancang untuk siswa dan tutor di Indonesia.
          </p>
        </div>
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <CardContent className='space-y-2 pt-6'>
                <f.icon className='text-primary size-7' />
                <h3 className='h4'>{f.title}</h3>
                <p className='text-muted-foreground text-sm'>{f.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className='bg-primary-50 py-16'>
      <div className='layout space-y-8'>
        <div className='text-center'>
          <h2 className='h2'>Cara Kerja</h2>
        </div>
        <div className='grid gap-6 md:grid-cols-3'>
          {[
            { n: 1, title: 'Daftar', body: 'Buat akun siswa atau tutor.' },
            { n: 2, title: 'Pilih', body: 'Cari tutor dan ajukan aplikasi.' },
            {
              n: 3,
              title: 'Belajar',
              body: 'Pesan sesi, bayar, dan ikuti pembelajaran.',
            },
          ].map((s) => (
            <div key={s.n} className='space-y-2 text-center'>
              <div className='bg-primary text-primary-foreground mx-auto flex size-10 items-center justify-center rounded-full text-lg font-bold'>
                {s.n}
              </div>
              <h3 className='h4'>{s.title}</h3>
              <p className='text-muted-foreground text-sm'>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className='py-16'>
      <div className='layout space-y-8'>
        <div className='text-center'>
          <h2 className='h2'>Paket</h2>
        </div>
        <div className='mx-auto grid max-w-3xl gap-5 sm:grid-cols-2'>
          <Card>
            <CardContent className='space-y-3 pt-6'>
              <h3 className='h3'>Premium Siswa</h3>
              <p className='text-primary text-2xl font-bold'>Rp 50.000/bln</p>
              <ul className='text-muted-foreground space-y-1 text-sm'>
                <li>✓ Akses materi premium</li>
                <li>✓ Prioritas booking</li>
                <li>✓ Dukungan langsung</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='space-y-3 pt-6'>
              <h3 className='h3 flex items-center gap-2'>
                Pro Tutor <Sparkles className='size-5 text-amber-500' />
              </h3>
              <p className='text-primary text-2xl font-bold'>Rp 100.000/bln</p>
              <ul className='text-muted-foreground space-y-1 text-sm'>
                <li>✓ Komisi lebih rendah</li>
                <li>✓ Analitik lengkap</li>
                <li>✓ Badge Pro</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  return (
    <section className='bg-primary-50 py-16'>
      <div className='layout max-w-3xl space-y-6'>
        <h2 className='h2 text-center'>Pertanyaan Umum</h2>
        <Accordion type='single' collapsible>
          <AccordionItem value='1'>
            <AccordionTrigger>Bagaimana cara mendaftar?</AccordionTrigger>
            <AccordionContent>
              Klik tombol Daftar di atas, pilih peran (siswa atau tutor),
              dan isi data dasar. Verifikasi email akan dikirim.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='2'>
            <AccordionTrigger>Apakah pembayaran aman?</AccordionTrigger>
            <AccordionContent>
              Ya. Setiap pembayaran diverifikasi admin sebelum dana
              dilepas ke tutor.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='3'>
            <AccordionTrigger>Bagaimana tutor diverifikasi?</AccordionTrigger>
            <AccordionContent>
              Admin meninjau dokumen identitas dan bukti pendidikan
              sebelum tutor dapat menerima sesi.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className='border-t bg-white py-8'>
      <div className='layout flex flex-col items-center justify-between gap-3 sm:flex-row'>
        <div className='inline-flex items-center gap-2 text-sm font-semibold'>
          <GraduationCap className='text-primary size-5' />
          DBBConnect
        </div>
        <div className='text-muted-foreground text-xs'>
          © {new Date().getFullYear()} DBBConnect. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
