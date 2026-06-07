import * as React from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

interface StepperProps {
  steps: string[];
  current: number;
  className?: string;
}

export function Stepper({ steps, current, className }: StepperProps) {
  return (
    <ol
      className={cn(
        'flex items-center justify-between gap-2 rounded-lg border bg-white p-3',
        className,
      )}
    >
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={label}>
            <li className='flex flex-1 items-center gap-2'>
              <span
                className={cn(
                  'mono flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors',
                  done
                    ? 'bg-emerald-500 text-white'
                    : active
                      ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {done ? <Check className='size-3.5' /> : i + 1}
              </span>
              <span
                className={cn(
                  'text-xs font-medium',
                  active
                    ? 'text-primary-700'
                    : done
                      ? 'text-emerald-700'
                      : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </li>
            {i < steps.length - 1 ? (
              <span
                className={cn(
                  'h-px w-8 shrink-0',
                  i < current ? 'bg-emerald-500' : 'bg-border',
                )}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </ol>
  );
}
