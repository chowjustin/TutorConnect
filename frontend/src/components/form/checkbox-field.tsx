'use client';

import * as React from 'react';
import {
  Controller,
  useFormContext,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CheckboxFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  helperText?: string;
  validation?: RegisterOptions<T, Path<T>>;
  containerClassName?: string;
}

export function CheckboxField<T extends FieldValues>({
  name,
  label,
  helperText,
  validation,
  containerClassName,
}: CheckboxFieldProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();
  const error = errors[name];

  return (
    <div className={cn('space-y-1', containerClassName)}>
      <div className='flex items-center gap-2'>
        <Controller
          control={control}
          name={name}
          rules={validation}
          render={({ field }) => (
            <Checkbox
              id={name}
              checked={!!field.value}
              onCheckedChange={field.onChange}
              aria-invalid={!!error || undefined}
            />
          )}
        />
        <Label htmlFor={name}>{label}</Label>
      </div>
      {error?.message ? (
        <p className='text-destructive text-xs'>{String(error.message)}</p>
      ) : helperText ? (
        <p className='text-muted-foreground text-xs'>{helperText}</p>
      ) : null}
    </div>
  );
}
