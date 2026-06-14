'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  children: React.ReactNode;
  onReset?: () => void;
  hasFilters?: boolean;
  resetLabel?: string;
  className?: string;
  cols?: 2 | 3 | 4 | 5 | 6;
}

const COLS_CLS: Record<number, string> = {
  2: 'grid-cols-2 md:grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-4',
  5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
};

export function FilterBar({
  children,
  onReset,
  hasFilters,
  resetLabel = 'Reset filter',
  className,
  cols = 6,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        'border-primary-100 rounded-lg border bg-white p-3',
        className,
      )}
    >
      <div className={cn('grid gap-x-3 gap-y-2', COLS_CLS[cols])}>
        {children}
      </div>
      {hasFilters && onReset ? (
        <div className='border-primary-100 mt-3 flex items-center justify-end border-t pt-3'>
          <Button size='sm' variant='outline' onClick={onReset}>
            {resetLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

interface FilterFieldProps {
  label: string;
  children: React.ReactNode;
}

export function FilterField({ label, children }: FilterFieldProps) {
  return (
    <div>
      <label className='text-muted-foreground mb-1 block text-[10px] font-semibold tracking-wide uppercase'>
        {label}
      </label>
      {children}
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  onValueChange: (v: string) => void;
  placeholder?: string;
  /** Sentinel value emitted when the "all" option is selected. Defaults to ''. */
  allValue?: string;
  /** Label for the "all" option. Set to null to omit. Defaults to 'Semua'. */
  allLabel?: string | null;
  options: { value: string; label: string }[];
}

export function FilterSelect({
  label,
  value,
  onValueChange,
  placeholder = 'Pilih',
  allValue = '__all__',
  allLabel = 'Semua',
  options,
}: FilterSelectProps) {
  const selected = value === '' ? allValue : value;
  return (
    <FilterField label={label}>
      <Select
        value={selected}
        onValueChange={(v) => onValueChange(v === allValue ? '' : v)}
      >
        <SelectTrigger size='sm' className='w-full'>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {allLabel !== null ? (
            <SelectItem value={allValue}>{allLabel}</SelectItem>
          ) : null}
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterField>
  );
}
