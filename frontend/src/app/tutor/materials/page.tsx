'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Download, Eye, FileText, FolderOpen } from 'lucide-react';

import api from '@/lib/api';
import useAuthStore from '@/store/use-auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { DropzoneField } from '@/components/form/dropzone-field';
import { SelectField } from '@/components/form/select-field';
import { TextareaField } from '@/components/form/textarea-field';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { downloadFromPath, fetchBlob } from '@/lib/download';
import { formatDateId } from '@/lib/format';
import {
  EDUCATION_LEVEL_OPTIONS,
  SUBJECT_OPTIONS,
  educationLevelLabel,
  subjectLabel,
} from '@/constant/enums';
import { usePagination } from '@/hooks/use-pagination';
import type { PaginatedApiResponse } from '@/types/api';

import { useUploadMaterial } from './hooks/mutation';

interface MaterialRow {
  id: string;
  title: string | null;
  fileUrl: string | null;
  fileName: string | null;
  subject: string | null;
  level: string | null;
  kind: string | null;
  createdAt: string;
}

interface UploadForm {
  file: File | null;
  subject: string;
  level: string;
  description: string;
}

const uploadSchema = z.object({
  file: z.any().refine((v) => v instanceof File, 'Pilih file materi'),
  subject: z.string(),
  level: z.string(),
  description: z.string(),
}) satisfies z.ZodType<UploadForm>;

const materialPath = (id: string) => `/upload/material/${id}`;

async function downloadMaterial(id: string, fallbackName: string) {
  await downloadFromPath(materialPath(id), fallbackName || `material-${id}`);
}

interface PreviewState {
  id: string;
  name: string;
  url: string;
  mime: string;
}

export default function TutorMaterialsPage() {
  const user = useAuthStore.useUser();
  const tutorProfileId = user?.tutorProfileId;
  const { params } = usePagination();
  const [preview, setPreview] = React.useState<PreviewState | null>(null);
  const upload = useUploadMaterial();

  const methods = useForm<UploadForm>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { file: null, subject: '', level: '', description: '' },
  });

  const openPreview = async (id: string, name: string) => {
    const blob = await fetchBlob(materialPath(id));
    const url = URL.createObjectURL(blob);
    setPreview({ id, name, url, mime: blob.type });
  };

  const closePreview = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const tutorQuery = useQuery<{
    data: MaterialRow[];
    meta: PaginatedApiResponse<MaterialRow[]>['meta'];
  }>({
    queryKey: ['/materials/tutor', tutorProfileId, params],
    queryFn: async () => {
      const res = await api.get(`/materials/tutor/${tutorProfileId}`, {
        params,
      });
      return res.data;
    },
    enabled: !!tutorProfileId,
  });

  const onUpload = methods.handleSubmit((values) => {
    if (!values.file) return;
    upload.mutate(
      {
        file: values.file,
        subject: values.subject || undefined,
        level: values.level || undefined,
        description: values.description || undefined,
      },
      { onSuccess: () => methods.reset() },
    );
  });

  const empty =
    !tutorQuery.isLoading && (tutorQuery.data?.data.length ?? 0) === 0;

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={FolderOpen}
        title='Materi'
        description='Unggah materi ajar yang dapat diakses siswa Anda.'
      />

      <Card className='hover:shadow-primary-500/5 transition-shadow hover:shadow-md'>
        <CardHeader>
          <CardTitle>Unggah Materi</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={onUpload} className='space-y-4'>
              <DropzoneField<UploadForm>
                name='file'
                accept='.pdf,.jpg,.jpeg,.png'
                maxSizeMB={20}
              />

              <SelectField<UploadForm>
                name='subject'
                label='Mapel'
                options={SUBJECT_OPTIONS}
                placeholder='Pilih mapel'
                className='w-full'
              />
              <SelectField<UploadForm>
                name='level'
                label='Level'
                options={EDUCATION_LEVEL_OPTIONS}
                placeholder='Pilih level'
                className='w-full'
              />

              <TextareaField<UploadForm>
                name='description'
                label='Deskripsi (opsional)'
                placeholder='Ringkasan singkat materi...'
                rows={3}
              />

              <Button
                type='submit'
                disabled={upload.isPending}
                className='w-full'
                size='lg'
              >
                {upload.isPending ? 'Mengunggah...' : 'Unggah'}
              </Button>
            </form>
          </FormProvider>
        </CardContent>
      </Card>

      <section>
        <h2 className='text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase'>
          Daftar Materi
        </h2>
        {tutorQuery.isLoading ? (
          <Skeleton className='h-40 w-full' />
        ) : empty ? (
          <EmptyState
            icon={FolderOpen}
            title='Belum ada materi'
            description='Unggah materi pertama Anda menggunakan form di atas.'
          />
        ) : (
          <div className='border-primary-100 overflow-hidden rounded-lg border bg-white'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nama File</TableHead>
                  <TableHead>Mapel</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tutorQuery.data?.data.map((m) => {
                  const name = m.fileName ?? m.title ?? '—';
                  return (
                    <TableRow key={m.id}>
                      <TableCell className='mono text-muted-foreground text-xs tabular-nums'>
                        {formatDateId(m.createdAt)}
                      </TableCell>
                      <TableCell className='max-w-xs truncate'>
                        {name}
                      </TableCell>
                      <TableCell>{subjectLabel(m.subject)}</TableCell>
                      <TableCell>{educationLevelLabel(m.level)}</TableCell>
                      <TableCell>
                        <div className='flex gap-2'>
                          <Button
                            variant='secondary'
                            size='sm'
                            onClick={() => openPreview(m.id, name)}
                          >
                            <Eye className='size-4' />
                            Lihat
                          </Button>
                          <Button
                            size='sm'
                            onClick={() => downloadMaterial(m.id, name)}
                          >
                            <Download className='size-4' />
                            Unduh
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <Dialog
        open={!!preview}
        onOpenChange={(o) => {
          if (!o) closePreview();
        }}
      >
        <DialogContent className='max-h-[90vh] overflow-hidden sm:max-w-4xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-base'>
              <FileText className='text-primary-700 size-4' />
              {preview?.name}
            </DialogTitle>
          </DialogHeader>
          {preview ? (
            preview.mime.startsWith('image/') ? (
              <div className='flex max-h-[70vh] items-center justify-center overflow-auto'>
                <img
                  src={preview.url}
                  alt={preview.name}
                  className='max-h-[70vh] object-contain'
                />
              </div>
            ) : preview.mime === 'application/pdf' ? (
              <iframe
                src={preview.url}
                title={preview.name}
                className='h-[70vh] w-full rounded-md border'
              />
            ) : (
              <div className='text-muted-foreground flex h-60 flex-col items-center justify-center gap-2 text-sm'>
                <FileText className='size-8' />
                Preview tidak tersedia untuk tipe ini.
              </div>
            )
          ) : null}
          {preview ? (
            <div className='flex justify-end'>
              <Button
                onClick={() => downloadMaterial(preview.id, preview.name)}
              >
                <Download className='size-4' />
                Unduh
              </Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
