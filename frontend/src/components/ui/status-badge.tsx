import * as React from 'react';

import { cn } from '@/lib/utils';
import { getStatusMeta, type StatusKind } from '@/lib/status';

interface StatusBadgeProps {
  kind: StatusKind;
  status: string;
  className?: string;
  size?: 'sm' | 'md';
  withDot?: boolean;
}

export function StatusBadge({
  kind,
  status,
  className,
  size = 'md',
  withDot = false,
}: StatusBadgeProps) {
  const meta = getStatusMeta(kind, status);
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        meta.className,
        className,
      )}
    >
      {withDot ? (
        <span className={cn('size-1.5 rounded-full', meta.dot)} />
      ) : (
        <Icon className={size === 'sm' ? 'size-3' : 'size-3.5'} />
      )}
      {meta.label}
    </span>
  );
}
