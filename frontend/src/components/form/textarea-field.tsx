'use client';

import * as React from 'react';
import {
  useFormContext,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form';

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface TextareaFieldProps<T extends FieldValues>
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  name: Path<T>;
  label?: string;
  helperText?: string;
  validation?: RegisterOptions<T, Path<T>>;
  containerClassName?: string;
}

export function TextareaField<T extends FieldValues>({
  name,
  label,
  helperText,
  validation,
  containerClassName,
  className,
  ...rest
}: TextareaFieldProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();
  const error = errors[name];

  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label ? <Label htmlFor={name}>{label}</Label> : null}
      <Textarea
        id={name}
        aria-invalid={!!error || undefined}
        className={className}
        {...register(name, validation)}
        {...rest}
      />
      {error?.message ? (
        <p className='text-destructive text-xs'>{String(error.message)}</p>
      ) : helperText ? (
        <p className='text-muted-foreground text-xs'>{helperText}</p>
      ) : null}
    </div>
  );
}
