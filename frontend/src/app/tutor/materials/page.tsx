'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Eye, FileText, FolderOpen } from 'lucide-react';

import api from '@/lib/api';
import useAuthStore from '@/store/use-auth-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Dropzone } from '@/components/form/dropzone-field';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDateId } from '@/lib/format';
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

const SUBJECT_LABEL: Record<string, string> = {
  MATH: 'Matematika',
  PHYSICS: 'Fisika',
  CHEMISTRY: 'Kimia',
  ENGLISH: 'Bahasa Inggris',
  COMPUTER_SCIENCE: 'Komputer',
  ECONOMICS: 'Ekonomi',
  ACCOUNTING: 'Akuntansi',
};

const LEVEL_LABEL: Record<string, string> = {
  JUNIOR_HIGH: 'SMP',
  SENIOR_HIGH: 'SMA',
  UNIVERSITY: 'Universitas',
};

const SUBJECTS = Object.keys(SUBJECT_LABEL);
const LEVELS = Object.keys(LEVEL_LABEL);

async function fetchMaterialBlob(id: string) {
  const res = await api.get(`/upload/material/${id}`, { responseType: 'blob' });
  return res.data as Blob;
}

async function downloadMaterial(id: string, fallbackName: string) {
  const blob = await fetchMaterialBlob(id);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fallbackName || `material-${id}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
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
  const [file, setFile] = React.useState<File | null>(null);
  const [subject, setSubject] = React.useState<string>('');
  const [level, setLevel] = React.useState<string>('');
  const [description, setDescription] = React.useState('');
  const [preview, setPreview] = React.useState<PreviewState | null>(null);
  const upload = useUploadMaterial();

  const openPreview = async (id: string, name: string) => {
    const blob = await fetchMaterialBlob(id);
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

  const onUpload = () => {
    if (!file) return;
    upload.mutate(
      {
        file,
        subject: subject || undefined,
        level: level || undefined,
        description: description || undefined,
      },
      {
        onSuccess: () => {
          setFile(null);
          setSubject('');
          setLevel('');
          setDescription('');
        },
      },
    );
  };

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
        <CardContent className='space-y-4'>
          <Dropzone
            value={file}
            onChange={setFile}
            accept='.pdf,.jpg,.jpeg,.png'
            maxSizeMB={20}
          />

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label>Mapel</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Pilih mapel' />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {SUBJECT_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-1.5'>
              <Label>Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Pilih level' />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {LEVEL_LABEL[l]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-1.5'>
            <Label>Deskripsi (opsional)</Label>
            <Textarea
              placeholder='Ringkasan singkat materi...'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={onUpload}
            disabled={upload.isPending || !file}
            className='w-full'
            size='lg'
          >
            {upload.isPending ? 'Mengunggah...' : 'Unggah'}
          </Button>
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
                      <TableCell>
                        {m.subject
                          ? (SUBJECT_LABEL[m.subject] ?? m.subject)
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {m.level ? (LEVEL_LABEL[m.level] ?? m.level) : '—'}
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
