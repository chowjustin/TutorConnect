'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TextField } from '@/components/form/text-field';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

interface BankRow {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isActive: boolean;
  notes: string | null;
}

const schema = z.object({
  bankName: z.string().min(1, 'Wajib diisi'),
  accountNumber: z.string().min(1, 'Wajib diisi'),
  accountHolder: z.string().min(1, 'Wajib diisi'),
  notes: z.string().optional().or(z.literal('')),
});
type BankForm = z.infer<typeof schema>;

export default function AdminPlatformBankPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery<BankRow[]>({
    queryKey: ['/admin/platform-bank'],
  });

  const methods = useForm<BankForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      notes: '',
    },
  });

  const create = useMutation({
    mutationFn: async (body: BankForm) => {
      const res = await api.post('/admin/platform-bank', body);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/admin/platform-bank'] });
      notifySuccess('Rekening ditambahkan');
      methods.reset();
    },
    onError: (e) => notifyAxiosError(e),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await api.patch(`/admin/platform-bank/${id}`, { isActive });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['/admin/platform-bank'] });
    },
    onError: (e) => notifyAxiosError(e),
  });

  const onSubmit = methods.handleSubmit((values) => create.mutate(values));

  return (
    <div className='space-y-4'>
      <h1 className='h2'>Rekening Platform</h1>

      <Card>
        <CardHeader>
          <CardTitle>Tambah Rekening</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={onSubmit} className='grid gap-3 sm:grid-cols-2'>
              <TextField<BankForm> name='bankName' label='Nama Bank' />
              <TextField<BankForm> name='accountNumber' label='No Rekening' />
              <TextField<BankForm> name='accountHolder' label='Atas Nama' />
              <TextField<BankForm> name='notes' label='Catatan' />
              <div className='sm:col-span-2'>
                <Button type='submit' disabled={create.isPending}>
                  Tambah
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Rekening</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {isLoading ? (
            <Skeleton className='h-40 w-full' />
          ) : (
            (data ?? []).map((b) => (
              <div
                key={b.id}
                className='flex items-center justify-between rounded-md border p-3'
              >
                <div>
                  <div className='font-semibold'>{b.bankName}</div>
                  <div className='text-muted-foreground text-xs'>
                    {b.accountNumber} a.n. {b.accountHolder}
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <Label className='text-xs'>Aktif</Label>
                  <Switch
                    checked={b.isActive}
                    onCheckedChange={(v) =>
                      toggle.mutate({ id: b.id, isActive: v })
                    }
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
