'use client';

import * as React from 'react';
import { FileText, FileType2 } from 'lucide-react';

import { cn } from '@/lib/utils';

interface FilePreviewProps {
  file: File | null;
  className?: string;
  /** Tailwind height token for preview area. Default `h-72`. */
  heightClassName?: string;
}

/**
 * Inline preview pane for picked file.
 * - Image: rendered <img> cover
 * - PDF: <iframe> first page
 * - Other: icon + filename fallback
 */
export function FilePreview({
  file,
  className,
  heightClassName = 'h-72',
}: FilePreviewProps) {
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  if (!file || !url) return null;

  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';

  return (
    <div
      className={cn(
        'border-primary-200 overflow-hidden rounded-lg border bg-white',
        className,
      )}
    >
      <div className='border-primary-100 bg-primary-50/40 flex items-center gap-2 border-b px-3 py-2 text-xs'>
        {isImage ? (
          <FileType2 className='text-primary-700 size-3.5' />
        ) : (
          <FileText className='text-primary-700 size-3.5' />
        )}
        <span className='truncate font-medium'>{file.name}</span>
      </div>
      {isImage ? (
        <div
          className={cn('flex items-center justify-center', heightClassName)}
        >
          <img src={url} alt={file.name} className='size-full object-contain' />
        </div>
      ) : isPdf ? (
        <iframe
          src={url}
          title={file.name}
          className={cn('w-full', heightClassName)}
        />
      ) : (
        <div
          className={cn(
            'text-muted-foreground flex flex-col items-center justify-center gap-2 text-sm',
            heightClassName,
          )}
        >
          <FileText className='size-8' />
          Preview tidak tersedia
        </div>
      )}
    </div>
  );
}
