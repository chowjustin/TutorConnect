'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const tileVariants = cva(
  'border-primary-100 group relative overflow-hidden rounded-2xl border bg-white p-5 transition-all hover:shadow-md hover:shadow-primary-500/5 md:p-6',
  {
    variants: {
      span: {
        sm: 'col-span-2 md:col-span-1',
        md: 'col-span-2',
        lg: 'col-span-2 md:col-span-2 row-span-2',
        wide: 'col-span-2 md:col-span-4',
      },
      tone: {
        plain: '',
        primary: 'from-primary-50/40 to-transparent bg-gradient-to-br',
        secondary: 'from-secondary-50/50 to-transparent bg-gradient-to-br',
      },
    },
    defaultVariants: {
      span: 'sm',
      tone: 'plain',
    },
  },
);

interface BentoTileProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tileVariants> {
  icon?: LucideIcon;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  loading?: boolean;
  children?: React.ReactNode;
}

export function BentoTile({
  icon: Icon,
  label,
  value,
  hint,
  loading,
  span,
  tone,
  children,
  className,
  ...rest
}: BentoTileProps) {
  return (
    <div className={cn(tileVariants({ span, tone }), className)} {...rest}>
      <div className='flex items-start justify-between gap-3'>
        <p className='text-muted-foreground text-xs font-medium tracking-wider uppercase'>
          {label}
        </p>
        {Icon ? (
          <Icon className='text-primary-400 size-4 shrink-0' strokeWidth={2} />
        ) : null}
      </div>
      <div className='mt-3'>
        {loading ? (
          <Skeleton className='h-9 w-24' />
        ) : (
          <div className='mono text-foreground text-3xl font-semibold tabular-nums md:text-4xl'>
            {value}
          </div>
        )}
        {hint ? (
          <div className='text-muted-foreground mt-1 text-xs'>{hint}</div>
        ) : null}
      </div>
      {children}
    </div>
  );
}
