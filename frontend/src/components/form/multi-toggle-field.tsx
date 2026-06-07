'use client';

import * as React from 'react';
import {
  Controller,
  useFormContext,
  type FieldValues,
  type Path,
} from 'react-hook-form';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface MultiToggleFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  helperText?: string;
  options: Option[];
  containerClassName?: string;
}

/**
 * Pill-style multi-select. Stores an array of option values in the form.
 */
export function MultiToggleField<T extends FieldValues>({
  name,
  label,
  helperText,
  options,
  containerClassName,
}: MultiToggleFieldProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label ? <Label>{label}</Label> : null}
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const value = (field.value as string[] | undefined) ?? [];
          const toggle = (v: string) => {
            const next = value.includes(v)
              ? value.filter((x) => x !== v)
              : [...value, v];
            field.onChange(next);
          };
          return (
            <div className='flex flex-wrap gap-2'>
              {options.map((o) => {
                const selected = value.includes(o.value);
                return (
                  <button
                    key={o.value}
                    type='button'
                    onClick={() => toggle(o.value)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                      selected
                        ? 'border-primary-300 bg-primary-100 text-primary-800 ring-2 ring-primary-200/60'
                        : 'border-input hover:border-primary-300 hover:bg-primary-50 text-muted-foreground',
                    )}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          );
        }}
      />
      {helperText ? (
        <p className='text-muted-foreground text-xs'>{helperText}</p>
      ) : null}
    </div>
  );
}
