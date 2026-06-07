'use client';

import * as React from 'react';
import {
  Controller,
  useFormContext,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  helperText?: string;
  validation?: RegisterOptions<T, Path<T>>;
  options: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
  className?: string;
}

export function SelectField<T extends FieldValues>({
  name,
  label,
  helperText,
  validation,
  options,
  placeholder,
  containerClassName,
  className,
}: SelectFieldProps<T>) {
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
          <Select
            value={field.value ?? ''}
            onValueChange={field.onChange}
          >
            <SelectTrigger
              id={name}
              aria-invalid={!!error || undefined}
              className={className}
            >
              <SelectValue placeholder={placeholder ?? 'Pilih'} />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
