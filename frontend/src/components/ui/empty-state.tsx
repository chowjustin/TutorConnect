import * as React from 'react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center',
        className,
      )}
    >
      <div className='bg-primary-50 text-primary-500 ring-primary-100 rounded-full p-5 ring-8 ring-opacity-50'>
        <Icon className='size-8' />
      </div>
      <div className='space-y-1'>
        <h3 className='h4 text-primary-900'>{title}</h3>
        {description ? (
          <p className='text-muted-foreground max-w-sm text-sm'>{description}</p>
        ) : null}
      </div>
      {action ? <div className='mt-2'>{action}</div> : null}
    </div>
  );
}
