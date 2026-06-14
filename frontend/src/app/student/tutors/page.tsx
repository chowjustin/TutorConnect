'use client';

import * as React from 'react';

import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FilterBar,
  FilterField,
  FilterSelect,
} from '@/components/ui/filter-bar';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { usePagination } from '@/hooks/use-pagination';
import { useDebounce } from '@/hooks/use-debounce';
import {
  EDUCATION_LEVEL_OPTIONS,
  SUBJECT_OPTIONS,
  TEACHING_METHOD_OPTIONS,
} from '@/constant/enums';
import type { EducationLevel, Subject, TeachingMethod } from '@/types/shared';

import { TutorCard } from './components/tutor-card';
import { useTutorSearch } from './hooks/query';
import { useActiveApplicationByTutor } from './hooks/use-my-applications';
import type { TutorSearchFilters } from './types';

type SortBy = 'featured' | 'rating' | 'priceAsc' | 'priceDesc';

export default function StudentTutorsPage() {
  const { params, setParams } = usePagination({ defaultPerPage: 12 });
  const [search, setSearch] = React.useState(params.search);
  const debounced = useDebounce(search, 400);
  const [subject, setSubject] = React.useState<Subject | ''>('');
  const [level, setLevel] = React.useState<EducationLevel | ''>('');
  const [method, setMethod] = React.useState<TeachingMethod | ''>('');
  const [maxRate, setMaxRate] = React.useState<string>('');
  const [minRating, setMinRating] = React.useState<string>('');
  const [sortBy, setSortBy] = React.useState<SortBy>('featured');

  React.useEffect(() => {
    if (debounced !== params.search) {
      setParams({ search: debounced, page: 1 });
    }
  }, [debounced, params.search, setParams]);

  React.useEffect(() => {
    setParams({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, level, method, maxRate, minRating, sortBy]);

  const filters: TutorSearchFilters = {
    name: params.search || undefined,
    subject: subject || undefined,
    educationLevel: level || undefined,
    methods: method ? [method] : undefined,
    maxRate: maxRate ? Number(maxRate) : undefined,
    minRating: minRating ? Number(minRating) : undefined,
    sortBy,
  };
  const { data, isLoading } = useTutorSearch(filters, params);
  const { map: appMap } = useActiveApplicationByTutor();
  const tutors = data?.data ?? [];
  const meta = data?.meta;

  const hasFilters =
    !!subject ||
    !!level ||
    !!method ||
    !!maxRate ||
    !!minRating ||
    sortBy !== 'featured';
  const resetFilters = () => {
    setSubject('');
    setLevel('');
    setMethod('');
    setMaxRate('');
    setMinRating('');
    setSortBy('featured');
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='h2'>Cari Tutor</h1>
        <span className='text-muted-foreground text-sm'>
          {meta?.count ?? 0} tutor
        </span>
      </div>

      <Input
        placeholder='Cari nama tutor...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='max-w-md'
      />

      <FilterBar cols={6} hasFilters={hasFilters} onReset={resetFilters}>
        <FilterSelect
          label='Mata Pelajaran'
          value={subject}
          onValueChange={(v) => setSubject(v as Subject | '')}
          allLabel='Semua mapel'
          options={SUBJECT_OPTIONS}
        />
        <FilterSelect
          label='Jenjang'
          value={level}
          onValueChange={(v) => setLevel(v as EducationLevel | '')}
          allLabel='Semua jenjang'
          options={EDUCATION_LEVEL_OPTIONS}
        />
        <FilterSelect
          label='Metode Pengajaran'
          value={method}
          onValueChange={(v) => setMethod(v as TeachingMethod | '')}
          allLabel='Semua metode'
          options={TEACHING_METHOD_OPTIONS}
        />
        <FilterField label='Tarif Maksimum (Rp)'>
          <Input
            type='number'
            placeholder='Misal 100000'
            value={maxRate}
            onChange={(e) => setMaxRate(e.target.value)}
            className='h-8 text-xs'
          />
        </FilterField>
        <FilterSelect
          label='Rating minimum'
          value={minRating}
          onValueChange={setMinRating}
          allLabel='Semua rating'
          options={[
            { value: '3', label: '≥ 3.0' },
            { value: '4', label: '≥ 4.0' },
            { value: '4.5', label: '≥ 4.5' },
          ]}
        />
        <FilterSelect
          label='Urutkan'
          value={sortBy}
          onValueChange={(v) => setSortBy(v as SortBy)}
          allLabel={null}
          options={[
            { value: 'featured', label: 'Direkomendasikan' },
            { value: 'rating', label: 'Rating tertinggi' },
            { value: 'priceAsc', label: 'Termurah' },
            { value: 'priceDesc', label: 'Termahal' },
          ]}
        />
      </FilterBar>

      {isLoading ? (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className='h-52 rounded-lg' />
          ))}
        </div>
      ) : tutors.length === 0 ? (
        <div className='text-muted-foreground rounded-md border py-12 text-center text-sm'>
          Tidak ada tutor sesuai filter.
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {tutors.map((t) => (
            <TutorCard
              key={t.id}
              tutor={t}
              applicationStatus={appMap.get(t.id)}
            />
          ))}
        </div>
      )}

      {meta && meta.max_page > 1 ? (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() =>
                  setParams({ page: Math.max(1, params.page - 1) })
                }
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive>{params.page}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setParams({
                    page: Math.min(meta.max_page, params.page + 1),
                  })
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  );
}
