'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import useAuthStore from '@/store/use-auth-store';
import { SIDEBAR_ENTRIES } from '@/components/layout/sidebar-entries';

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const user = useAuthStore.useUser();
  const entries = user ? SIDEBAR_ENTRIES[user.role] : [];

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder='Ketik untuk mencari...' />
      <CommandList>
        <CommandEmpty>Tidak ada hasil.</CommandEmpty>
        {entries.length ? (
          <>
            <CommandGroup heading='Navigasi'>
              {entries.map((e) => (
                <CommandItem
                  key={e.href}
                  onSelect={() => go(e.href)}
                  className='gap-2'
                >
                  <e.icon className='size-4' />
                  {e.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        ) : null}
        <CommandGroup heading='Aksi'>
          <CommandItem onSelect={() => go('/auth/login')}>Masuk</CommandItem>
          <CommandItem onSelect={() => go('/auth/register')}>Daftar</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
