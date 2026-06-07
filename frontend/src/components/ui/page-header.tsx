import * as React from 'react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className='flex items-start gap-3'>
        {Icon ? (
          <div className='bg-primary-100 text-primary-700 ring-primary-200/60 mt-0.5 rounded-lg p-2 ring-1'>
            <Icon className='size-5' />
          </div>
        ) : null}
        <div>
          <h1 className='h2'>{title}</h1>
          {description ? (
            <p className='text-muted-foreground text-sm md:text-base'>
              {description}
            </p>
          ) : null}
        </div>
      </div>
      {actions ? <div className='flex gap-2'>{actions}</div> : null}
    </div>
  );
}
