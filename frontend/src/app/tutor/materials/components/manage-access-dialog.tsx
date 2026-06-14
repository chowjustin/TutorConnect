'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

interface TutorStudent {
  id: string;
  name: string;
  email: string;
}

interface AccessResponse {
  materialId: string;
  studentIds: string[];
}

interface Props {
  materialId: string | null;
  onClose: () => void;
}

export function ManageAccessDialog({ materialId, onClose }: Props) {
  const qc = useQueryClient();
  const open = !!materialId;
  const [selected, setSelected] = React.useState<string[]>([]);

  const studentsQ = useQuery<{ data: TutorStudent[] }>({
    queryKey: ['/tutors/me/students', { disable_pagination: true }],
    queryFn: async () => {
      const res = await api.get('/tutors/me/students', {
        params: { disable_pagination: true },
      });
      return res.data;
    },
    enabled: open,
  });

  const accessQ = useQuery<AccessResponse>({
    queryKey: [`/materials/${materialId}/access`],
    queryFn: async () => {
      const res = await api.get(`/materials/${materialId}/access`);
      return res.data;
    },
    enabled: open && !!materialId,
  });

  React.useEffect(() => {
    if (accessQ.data) setSelected(accessQ.data.studentIds);
  }, [accessQ.data]);

  const save = useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/materials/${materialId}/access`, {
        studentIds: selected,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/materials/tutor'] });
      qc.invalidateQueries({
        queryKey: [`/materials/${materialId}/access`],
      });
      notifySuccess('Akses materi diperbarui');
      onClose();
    },
    onError: (e) => notifyAxiosError(e),
  });

  const students = studentsQ.data?.data ?? [];
  const allSelected =
    students.length > 0 && selected.length === students.length;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Kelola Akses Materi</DialogTitle>
          <DialogDescription>
            Pilih siswa yang dapat mengakses materi ini. Dapat diubah kapan
            saja.
          </DialogDescription>
        </DialogHeader>

        {studentsQ.isLoading || accessQ.isLoading ? (
          <Skeleton className='h-40 w-full' />
        ) : students.length === 0 ? (
          <p className='text-muted-foreground py-6 text-center text-sm'>
            Belum ada siswa yang diterima.
          </p>
        ) : (
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground text-xs'>
                {selected.length} / {students.length} dipilih
              </span>
              <button
                type='button'
                className='text-primary-700 hover:text-primary-900 text-xs font-medium'
                onClick={() =>
                  setSelected(allSelected ? [] : students.map((s) => s.id))
                }
              >
                {allSelected ? 'Kosongkan' : 'Pilih semua'}
              </button>
            </div>
            <div className='border-primary-100 max-h-64 space-y-1 overflow-auto rounded-lg border bg-white p-2'>
              {students.map((s) => {
                const isOn = selected.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className='hover:bg-primary-50 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5'
                  >
                    <input
                      type='checkbox'
                      checked={isOn}
                      onChange={(e) =>
                        setSelected((prev) =>
                          e.target.checked
                            ? [...prev, s.id]
                            : prev.filter((id) => id !== s.id),
                        )
                      }
                      className='border-primary-300 text-primary-600 size-4 rounded'
                    />
                    <div className='min-w-0 flex-1 text-sm'>
                      <div className='truncate font-medium'>{s.name}</div>
                      <div className='text-muted-foreground truncate text-xs'>
                        {s.email}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={onClose}
            disabled={save.isPending}
          >
            Batal
          </Button>
          <Button
            type='button'
            onClick={() => save.mutate()}
            disabled={
              save.isPending || studentsQ.isLoading || accessQ.isLoading
            }
          >
            {save.isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
