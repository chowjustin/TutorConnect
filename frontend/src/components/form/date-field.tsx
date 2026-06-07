'use client';

import * as React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Controller,
  useFormContext,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface DateFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  helperText?: string;
  validation?: RegisterOptions<T, Path<T>>;
  showTimeSelect?: boolean;
  placeholderText?: string;
  minDate?: Date;
  maxDate?: Date;
  containerClassName?: string;
  className?: string;
}

/**
 * react-datepicker wrapped in RHF Controller. Stores ISO string in the form
 * value (`new Date().toISOString()`). Renders an Input-styled trigger.
 */
export function DateField<T extends FieldValues>({
  name,
  label,
  helperText,
  validation,
  showTimeSelect,
  placeholderText,
  minDate,
  maxDate,
  containerClassName,
  className,
}: DateFieldProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();
  const error = errors[name];

  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label ? <Label htmlFor={name}>{label}</Label> : null}
      <Controller
        control={control}
        name={name}
        rules={validation}
        render={({ field }) => (
          <DatePicker
            id={name}
            selected={field.value ? new Date(field.value) : null}
            onChange={(d: Date | null) => field.onChange(d ? d.toISOString() : '')}
            showTimeSelect={showTimeSelect}
            dateFormat={showTimeSelect ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy'}
            placeholderText={placeholderText ?? 'Pilih tanggal'}
            minDate={minDate}
            maxDate={maxDate}
            className={cn(
              'border-input bg-background h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs',
              'focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none',
              error && 'border-destructive',
              className,
            )}
          />
        )}
      />
      {error?.message ? (
        <p className='text-destructive text-xs'>{String(error.message)}</p>
      ) : helperText ? (
        <p className='text-muted-foreground text-xs'>{helperText}</p>
      ) : null}
    </div>
  );
}
