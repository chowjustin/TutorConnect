'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

interface Section {
  id: string;
  label: string;
}

interface Props {
  sections: Section[];
}

export function SectionToc({ sections }: Props) {
  const [active, setActive] = React.useState<string>(sections[0]?.id ?? '');

  React.useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [sections]);

  return (
    <nav aria-label='Section navigation' className='space-y-1.5 text-sm'>
      <p className='text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase'>
        Bagian
      </p>
      <ul className='space-y-1'>
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={cn(
                'block border-l-2 py-1 pl-3 transition-colors',
                active === s.id
                  ? 'border-primary-600 text-primary-800 font-medium'
                  : 'text-muted-foreground hover:text-foreground border-transparent',
              )}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
