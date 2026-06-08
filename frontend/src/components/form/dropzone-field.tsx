'use client';

import * as React from 'react';
import {
  Controller,
  useFormContext,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from 'react-hook-form';
import { FileText, UploadCloud, X, ZoomIn } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImageLightbox } from '@/components/ui/image-lightbox';
import { cn } from '@/lib/utils';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

interface DropzoneProps {
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
  error?: boolean;
  hint?: string;
  className?: string;
}

export function Dropzone({
  value,
  onChange,
  accept,
  maxSizeMB = 5,
  error,
  hint,
  className,
}: DropzoneProps) {
  const [dragOver, setDragOver] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  const file = value;
  const isImage = !!file && file.type.startsWith('image/');

  React.useEffect(() => {
    if (file && isImage) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
    return undefined;
  }, [file, isImage]);

  const handleFiles = (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (f.size > maxSizeMB * 1024 * 1024) {
      alert(`Ukuran file melebihi ${maxSizeMB} MB`);
      return;
    }
    onChange(f);
  };

  const hintText =
    hint ??
    `Maks ${maxSizeMB} MB${accept ? ` · ${accept.replace(/\./g, '').toUpperCase()}` : ''}`;

  if (file) {
    return (
      <div className={cn('space-y-2', className)}>
        <div
          className={cn(
            'group flex items-center gap-3 rounded-lg border p-3 transition-shadow',
            error
              ? 'border-destructive'
              : 'border-primary-200 bg-primary-50/30 hover:shadow-sm',
          )}
        >
          {isImage && previewUrl ? (
            <button
              type='button'
              onClick={() => setLightboxOpen(true)}
              className='relative size-16 shrink-0 overflow-hidden rounded-md border bg-white'
            >
              <img
                src={previewUrl}
                alt={file.name}
                className='size-full object-cover'
              />
              <span className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
                <ZoomIn className='size-5 text-white' />
              </span>
            </button>
          ) : (
            <div className='bg-primary-100 text-primary-700 flex size-16 shrink-0 items-center justify-center rounded-md'>
              <FileText className='size-7' />
            </div>
          )}
          <div className='min-w-0 flex-1 text-sm'>
            <div className='truncate font-medium'>{file.name}</div>
            <div className='text-muted-foreground mono text-xs'>
              {formatSize(file.size)}
            </div>
          </div>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            aria-label='Hapus file'
            onClick={() => onChange(null)}
          >
            <X className='size-4' />
          </Button>
        </div>
        {isImage && previewUrl ? (
          <ImageLightbox
            open={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            slides={[{ src: previewUrl }]}
          />
        ) : null}
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        'flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center transition-all',
        dragOver
          ? 'border-primary-500 bg-primary-50 scale-[1.01]'
          : 'border-primary-200 hover:border-primary-300 hover:bg-primary-50/40',
        error && 'border-destructive',
        className,
      )}
    >
      <div className='bg-primary-100 text-primary-700 rounded-full p-3'>
        <UploadCloud className='size-6' />
      </div>
      <div>
        <div className='text-sm font-medium'>
          Klik untuk pilih file atau drag & drop
        </div>
        <div className='text-muted-foreground mt-1 text-xs'>{hintText}</div>
      </div>
      <input
        type='file'
        accept={accept}
        className='sr-only'
        onChange={(e) => handleFiles(e.target.files)}
      />
    </label>
  );
}

interface DropzoneFieldProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  helperText?: string;
  validation?: RegisterOptions<T, Path<T>>;
  accept?: string;
  maxSizeMB?: number;
  containerClassName?: string;
}

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
        render={({ field }) => (
          <Dropzone
            value={(field.value as File | null) ?? null}
            onChange={field.onChange}
            accept={accept}
            maxSizeMB={maxSizeMB}
            error={!!error}
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
