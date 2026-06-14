'use client';

import { useQuery } from '@tanstack/react-query';
import * as React from 'react';
import { Download, FileText, Folder, Sparkles } from 'lucide-react';

import api from '@/lib/api';
import useAuthStore from '@/store/use-auth-store';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import { FilterBar, FilterSelect } from '@/components/ui/filter-bar';
import { notifyError } from '@/lib/toast';
import { formatDateId } from '@/lib/format';
import { apiUrl } from '@/constant/env';
import { getToken } from '@/lib/cookie';
import {
  EDUCATION_LEVEL_OPTIONS,
  SUBJECT_OPTIONS,
  subjectLabel,
} from '@/constant/enums';
import { usePagination } from '@/hooks/use-pagination';
import type { PaginatedApiResponse } from '@/types/api';

interface MaterialRow {
  id: string;
  title: string | null;
  fileName: string | null;
  subject: string | null;
  level: string | null;
  kind: string | null;
  description: string | null;
  isPremium: boolean;
  createdAt: string;
  tutor?: { user: { name: string } };
}

export default function StudentMaterialsPage() {
  const user = useAuthStore.useUser();
  const { params } = usePagination();
  const [filterSubject, setFilterSubject] = React.useState('');
  const [filterLevel, setFilterLevel] = React.useState('');
  const [filterTier, setFilterTier] = React.useState<
    '' | 'premium' | 'reguler'
  >('');

  const studentProfileId = user?.studentProfileId;
  const queryParams = {
    ...params,
    disable_pagination: true,
    ...(filterSubject ? { subject: filterSubject } : {}),
    ...(filterLevel ? { level: filterLevel } : {}),
    ...(filterTier === 'premium'
      ? { isPremium: true }
      : filterTier === 'reguler'
        ? { isPremium: false }
        : {}),
  };
  const { data, isLoading } = useQuery<{
    data: MaterialRow[];
    meta: PaginatedApiResponse<MaterialRow[]>['meta'];
  }>({
    queryKey: ['/materials/student', studentProfileId, queryParams],
    queryFn: async () => {
      const res = await api.get(`/materials/student/${studentProfileId}`, {
        params: queryParams,
      });
      return res.data;
    },
    enabled: !!studentProfileId,
  });

  const download = async (id: string, fileName: string | null) => {
    const token = getToken();
    await api
      .post(`/tracking/material-view`, { materialId: id })
      .catch(() => {});
    const res = await fetch(`${apiUrl}/api/upload/material/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      let msg = 'Gagal mengunduh materi';
      try {
        const body = await res.json();
        if (body?.message) msg = body.message;
      } catch {
        // ignore parse error
      }
      notifyError(msg);
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName ?? `material-${id}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Group by subject
  const grouped = (data?.data ?? []).reduce<Record<string, MaterialRow[]>>(
    (acc, m) => {
      const key = m.subject ?? 'LAINNYA';
      (acc[key] ||= []).push(m);
      return acc;
    },
    {},
  );
  const groups = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={FileText}
        title='Materi'
        description='Bahan ajar dari tutor Anda, dikelompokkan per mata pelajaran.'
      />

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
          onValueChange={(v) => setFilterTier(v as '' | 'premium' | 'reguler')}
          allLabel='Semua tipe'
          options={[
            { value: 'premium', label: 'Premium' },
            { value: 'reguler', label: 'Reguler' },
          ]}
        />
      </FilterBar>

      {isLoading ? (
        <Skeleton className='h-40 w-full' />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={FileText}
          title='Belum ada materi'
          description='Materi yang dibagikan tutor akan muncul di sini.'
        />
      ) : (
        <div className='space-y-6'>
          {groups.map(([subjectKey, items]) => (
            <section key={subjectKey}>
              <div className='border-primary-100 mb-3 flex items-center gap-2 border-b pb-2'>
                <Folder className='text-primary-600 size-4' />
                <h2 className='text-foreground text-base font-semibold'>
                  {subjectLabel(subjectKey)}
                </h2>
                <span className='text-muted-foreground mono text-xs tabular-nums'>
                  {items.length} materi
                </span>
              </div>

              <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                {items.map((m) => (
                  <article
                    key={m.id}
                    className={`group flex flex-col gap-3 rounded-lg border p-4 transition-all hover:shadow-md ${
                      m.isPremium
                        ? 'border-secondary-200 from-secondary-50/40 hover:border-secondary-300 hover:shadow-secondary-500/5 bg-gradient-to-br to-white'
                        : 'border-primary-100 hover:border-primary-300 hover:shadow-primary-500/5 bg-white'
                    }`}
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <div className='border-primary-100 text-primary-600 bg-primary-50 flex size-9 shrink-0 items-center justify-center rounded-md border'>
                        <FileText className='size-4' />
                      </div>
                      {m.isPremium ? (
                        <span className='border-secondary-200 bg-secondary-50 text-secondary-800 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase'>
                          <Sparkles className='size-3' />
                          Premium
                        </span>
                      ) : null}
                    </div>
                    <div className='min-w-0'>
                      <div className='truncate text-sm font-semibold'>
                        {m.title ?? m.fileName ?? '—'}
                      </div>
                      {m.description ? (
                        <p className='text-muted-foreground mt-0.5 line-clamp-2 text-xs'>
                          {m.description}
                        </p>
                      ) : null}
                      <div className='text-muted-foreground mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]'>
                        <span>{m.tutor?.user.name ?? '—'}</span>
                        <span aria-hidden>·</span>
                        <span className='mono tabular-nums'>
                          {formatDateId(m.createdAt)}
                        </span>
                      </div>
                    </div>
                    <Button
                      size='sm'
                      onClick={() => download(m.id, m.fileName)}
                      className='mt-auto'
                    >
                      <Download className='size-3.5' /> Unduh
                    </Button>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
