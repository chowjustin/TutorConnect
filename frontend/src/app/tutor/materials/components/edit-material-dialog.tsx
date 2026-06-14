'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EDUCATION_LEVEL_OPTIONS, SUBJECT_OPTIONS } from '@/constant/enums';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

interface Material {
  id: string;
  title: string | null;
  subject: string | null;
  level: string | null;
  description: string | null;
  isPremium: boolean;
}

interface Props {
  material: Material | null;
  onClose: () => void;
}

export function EditMaterialDialog({ material, onClose }: Props) {
  const qc = useQueryClient();
  const open = !!material;
  const [title, setTitle] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [level, setLevel] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isPremium, setIsPremium] = React.useState(false);

  React.useEffect(() => {
    if (material) {
      setTitle(material.title ?? '');
      setSubject(material.subject ?? '');
      setLevel(material.level ?? '');
      setDescription(material.description ?? '');
      setIsPremium(material.isPremium);
    }
  }, [material]);

  const save = useMutation({
    mutationFn: async () => {
      const res = await api.patch(`/materials/${material!.id}`, {
        title: title.trim() || undefined,
        subject: subject || undefined,
        level: level || undefined,
        description: description.trim() || undefined,
        isPremium,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/materials/tutor'] });
      notifySuccess('Materi diperbarui');
      onClose();
    },
    onError: (e) => notifyAxiosError(e),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Edit Materi</DialogTitle>
          <DialogDescription>
            Ubah nama, mapel, level, atau status premium.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-1.5'>
            <Label htmlFor='edit-title'>Nama Materi</Label>
            <Input
              id='edit-title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='misal: Kalkulus Bab 3 — Turunan'
            />
          </div>
          <div className='grid gap-3 sm:grid-cols-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='edit-subject'>Mapel</Label>
              <select
                id='edit-subject'
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className='border-input bg-background h-9 w-full rounded-md border px-3 text-sm'
              >
                <option value=''>—</option>
                {SUBJECT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='edit-level'>Level</Label>
              <select
                id='edit-level'
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className='border-input bg-background h-9 w-full rounded-md border px-3 text-sm'
              >
                <option value=''>—</option>
                {EDUCATION_LEVEL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className='space-y-1.5'>
            <Label htmlFor='edit-description'>Deskripsi (opsional)</Label>
            <Textarea
              id='edit-description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <label className='border-primary-100 flex cursor-pointer items-start gap-3 rounded-lg border bg-white p-3 text-sm'>
            <input
              type='checkbox'
              className='border-primary-300 text-primary-600 mt-0.5 size-4 rounded'
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
            />
            <div>
              <div className='font-semibold'>Materi premium</div>
              <p className='text-muted-foreground text-xs'>
                Hanya siswa Premium Siswa yang bisa mengunduh.
              </p>
            </div>
          </label>
        </div>

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
            disabled={save.isPending || !title.trim()}
          >
            {save.isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
