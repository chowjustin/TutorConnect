'use client';

import * as React from 'react';
import {
  Controller,
  useFormContext,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form';
import { Upload, X } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DropzoneFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  helperText?: string;
  validation?: RegisterOptions<T, Path<T>>;
  accept?: string;
  maxSizeMB?: number;
  containerClassName?: string;
}

/**
 * Single-file dropzone bound to RHF. Stores `File | null` in form value.
 * Caller is responsible for FormData.append on submit.
 */
export function DropzoneField<T extends FieldValues>({
  name,
  label,
  helperText,
  validation,
  accept,
  maxSizeMB = 5,
  containerClassName,
}: DropzoneFieldProps<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();
  const error = errors[name];

  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label ? <Label>{label}</Label> : null}
      <Controller
        control={control}
        name={name}
        rules={validation}
        render={({ field }) => {
          const file = field.value as File | null;
          return (
            <div
              className={cn(
                'rounded-md border border-dashed p-4',
                error && 'border-destructive',
              )}
            >
              {file ? (
                <div className='flex items-center justify-between gap-3'>
                  <div className='min-w-0 text-sm'>
                    <div className='truncate font-medium'>{file.name}</div>
                    <div className='text-muted-foreground text-xs'>
                      {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <Button
                    type='button'
                    size='icon-sm'
                    variant='ghost'
                    onClick={() => field.onChange(null)}
                  >
                    <X className='size-4' />
                  </Button>
                </div>
              ) : (
                <label className='flex flex-col items-center gap-2 text-center'>
                  <Upload className='text-muted-foreground size-6' />
                  <span className='text-sm'>
                    Klik untuk upload atau drag & drop
                  </span>
                  <span className='text-muted-foreground text-xs'>
                    Maks {maxSizeMB} MB
                    {accept ? ` · ${accept}` : ''}
                  </span>
                  <input
                    type='file'
                    accept={accept}
                    className='sr-only'
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (f.size > maxSizeMB * 1024 * 1024) {
                        alert(`Ukuran file melebihi ${maxSizeMB} MB`);
                        e.target.value = '';
                        return;
                      }
                      field.onChange(f);
                    }}
                  />
                </label>
              )}
            </div>
          );
        }}
      />
      {error?.message ? (
        <p className='text-destructive text-xs'>{String(error.message)}</p>
      ) : helperText ? (
        <p className='text-muted-foreground text-xs'>{helperText}</p>
      ) : null}
    </div>
  );
}
