'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Download,
  Edit,
  Eye,
  FileText,
  FolderOpen,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react';

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
import { FilterBar, FilterSelect } from '@/components/ui/filter-bar';
import { DropzoneField } from '@/components/form/dropzone-field';
import { TextField } from '@/components/form/text-field';
import { SelectField } from '@/components/form/select-field';
import { TextareaField } from '@/components/form/textarea-field';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { downloadFromPath, fetchBlob } from '@/lib/download';
import { notifyAxiosError } from '@/lib/toast';
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
import { ManageAccessDialog } from './components/manage-access-dialog';
import { EditMaterialDialog } from './components/edit-material-dialog';

interface MaterialRow {
  id: string;
  title: string | null;
  fileUrl: string | null;
  fileName: string | null;
  subject: string | null;
  level: string | null;
  kind: string | null;
  description: string | null;
  isPremium: boolean;
  createdAt: string;
}

interface UploadForm {
  file: File | null;
  title: string;
  subject: string;
  level: string;
  description: string;
  isPremium: boolean;
}

const uploadSchema = z.object({
  file: z.any().refine((v) => v instanceof File, 'Pilih file materi'),
  title: z.string().trim().min(1, 'Nama materi wajib diisi'),
  subject: z.string(),
  level: z.string(),
  description: z.string(),
  isPremium: z.boolean(),
}) satisfies z.ZodType<UploadForm>;

const materialPath = (id: string) => `/upload/material/${id}`;

async function downloadMaterial(id: string, fallbackName: string) {
  try {
    await downloadFromPath(materialPath(id), fallbackName || `material-${id}`);
  } catch (e) {
    notifyAxiosError(e, 'Gagal mengunduh materi');
  }
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
  const [accessTarget, setAccessTarget] = React.useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<MaterialRow | null>(null);
  const upload = useUploadMaterial();

  const methods = useForm<UploadForm>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      file: null,
      title: '',
      subject: '',
      level: '',
      description: '',
      isPremium: false,
    },
  });

  // Prefill title from filename (without extension) when file changes.
  const watchedFile = methods.watch('file');
  React.useEffect(() => {
    if (watchedFile && !methods.getValues('title')) {
      const base = watchedFile.name.replace(/\.[^/.]+$/, '');
      methods.setValue('title', base, { shouldValidate: true });
    }
  }, [watchedFile, methods]);

  const openPreview = async (id: string, name: string) => {
    try {
      const blob = await fetchBlob(materialPath(id));
      const url = URL.createObjectURL(blob);
      setPreview({ id, name, url, mime: blob.type });
    } catch (e) {
      notifyAxiosError(e, 'Gagal membuka materi');
    }
  };

  const closePreview = () => {
    if (preview) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const [filterSubject, setFilterSubject] = React.useState('');
  const [filterLevel, setFilterLevel] = React.useState('');
  const [filterTier, setFilterTier] = React.useState<
    '' | 'premium' | 'reguler'
  >('');

  const queryParams = {
    ...params,
    ...(filterSubject ? { subject: filterSubject } : {}),
    ...(filterLevel ? { level: filterLevel } : {}),
    ...(filterTier === 'premium'
      ? { isPremium: true }
      : filterTier === 'reguler'
        ? { isPremium: false }
        : {}),
  };

  const tutorQuery = useQuery<{
    data: MaterialRow[];
    meta: PaginatedApiResponse<MaterialRow[]>['meta'];
  }>({
    queryKey: ['/materials/tutor', tutorProfileId, queryParams],
    queryFn: async () => {
      const res = await api.get(`/materials/tutor/${tutorProfileId}`, {
        params: queryParams,
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
        title: values.title.trim(),
        subject: values.subject || undefined,
        level: values.level || undefined,
        description: values.description || undefined,
        isPremium: values.isPremium,
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
        description='Materi ajar Anda dapat diakses siswa.'
        actions={
          <Button size='sm' onClick={() => setUploadOpen(true)}>
            <Plus className='size-4' /> Tambah Materi
          </Button>
        }
      />

      <Dialog
        open={uploadOpen}
        onOpenChange={(v) => {
          setUploadOpen(v);
          if (!v) methods.reset();
        }}
      >
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Unggah Materi</DialogTitle>
          </DialogHeader>
          <FormProvider {...methods}>
            <form
              onSubmit={(e) => {
                onUpload(e).then(() => setUploadOpen(false));
              }}
              className='space-y-4'
            >
              <DropzoneField<UploadForm>
                name='file'
                accept='.pdf,.jpg,.jpeg,.png'
                maxSizeMB={20}
              />
              <TextField<UploadForm>
                name='title'
                label='Nama Materi'
                placeholder='misal: Kalkulus Bab 3 — Turunan'
              />
              <div className='grid gap-3 sm:grid-cols-2'>
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
              </div>
              <TextareaField<UploadForm>
                name='description'
                label='Deskripsi (opsional)'
                placeholder='Ringkasan singkat materi...'
                rows={3}
              />
              <label className='border-primary-100 flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-3 text-sm'>
                <input
                  type='checkbox'
                  className='border-primary-300 text-primary-600 focus:ring-primary-400 mt-0.5 size-4 rounded'
                  checked={methods.watch('isPremium')}
                  onChange={(e) =>
                    methods.setValue('isPremium', e.target.checked)
                  }
                />
                <div>
                  <div className='font-semibold'>Materi premium</div>
                  <p className='text-muted-foreground text-xs'>
                    Hanya siswa Premium Siswa yang bisa mengunduh.
                  </p>
                </div>
              </label>
              <div className='flex justify-end gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setUploadOpen(false)}
                  disabled={upload.isPending}
                >
                  Batal
                </Button>
                <Button type='submit' disabled={upload.isPending}>
                  {upload.isPending ? 'Mengunggah...' : 'Unggah'}
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <section>
        <h2 className='text-muted-foreground mb-3 text-xs font-medium tracking-wider uppercase'>
          Daftar Materi
        </h2>
        <div className='mb-3'>
          <FilterBar
            cols={3}
            hasFilters={!!filterSubject || !!filterLevel || !!filterTier}
            onReset={() => {
              setFilterSubject('');
              setFilterLevel('');
              setFilterTier('');
            }}
          >
            <FilterSelect
              label='Mata Pelajaran'
              value={filterSubject}
              onValueChange={setFilterSubject}
              allLabel='Semua mapel'
              options={SUBJECT_OPTIONS}
            />
            <FilterSelect
              label='Jenjang'
              value={filterLevel}
              onValueChange={setFilterLevel}
              allLabel='Semua jenjang'
              options={EDUCATION_LEVEL_OPTIONS}
            />
            <FilterSelect
              label='Tipe'
              value={filterTier}
              onValueChange={(v) =>
                setFilterTier(v as '' | 'premium' | 'reguler')
              }
              allLabel='Semua tipe'
              options={[
                { value: 'premium', label: 'Premium' },
                { value: 'reguler', label: 'Reguler' },
              ]}
            />
          </FilterBar>
        </div>
        {tutorQuery.isLoading ? (
          <Skeleton className='h-40 w-full' />
        ) : empty ? (
          <EmptyState
            icon={FolderOpen}
            title='Belum ada materi'
            description='Unggah materi pertama Anda agar siswa dapat mengaksesnya.'
            action={
              <Button onClick={() => setUploadOpen(true)}>
                <Plus className='size-4' /> Tambah Materi
              </Button>
            }
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
                  <TableHead>Tipe</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(tutorQuery.data?.data ?? []).map((m) => {
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
                        {m.isPremium ? (
                          <span className='border-secondary-200 bg-secondary-50 text-secondary-800 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase'>
                            <Sparkles className='size-3' />
                            Premium
                          </span>
                        ) : (
                          <span className='border-primary-100 bg-primary-50/40 text-primary-700 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase'>
                            Reguler
                          </span>
                        )}
                      </TableCell>
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
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setEditTarget(m)}
                            className='border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 hover:text-amber-900'
                          >
                            <Edit className='size-4' />
                            Edit
                          </Button>
                          {m.isPremium ? (
                            <Button
                              variant='outline'
                              size='sm'
                              disabled
                              title='Materi premium otomatis tersedia untuk semua siswa berlangganan Premium Siswa. Akses per siswa tidak diperlukan.'
                              className='border-primary-100 text-muted-foreground'
                            >
                              <Users className='size-4' />
                              Auto
                            </Button>
                          ) : (
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => setAccessTarget(m.id)}
                              className='border-indigo-300 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 hover:text-indigo-900'
                            >
                              <Users className='size-4' />
                              Akses
                            </Button>
                          )}
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

      <ManageAccessDialog
        materialId={accessTarget}
        onClose={() => setAccessTarget(null)}
      />

      <EditMaterialDialog
        material={editTarget}
        onClose={() => setEditTarget(null)}
      />
    </div>
  );
}
