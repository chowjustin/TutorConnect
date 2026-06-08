'use client';

import { useMutation } from '@tanstack/react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles } from 'lucide-react';

import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { TextField } from '@/components/form/text-field';
import { SelectField } from '@/components/form/select-field';
import { MultiToggleField } from '@/components/form/multi-toggle-field';
import { PAYMENT_KIND_OPTIONS } from '@/constant/enums';
import { notifyAxiosError, notifySuccess } from '@/lib/toast';

interface PromoForm {
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: string;
  validUntil: string;
  maxUses: string;
  applicableKinds: string[];
  minAmount: string;
}

const schema = z.object({
  code: z.string().min(3, 'Min 3 karakter').max(40),
  discountType: z.enum(['PERCENT', 'FIXED']),
  discountValue: z.string().refine((s) => Number(s) >= 1, 'Min 1'),
  validUntil: z.string().min(1, 'Pilih tanggal berakhir'),
  maxUses: z.string().refine((s) => Number(s) >= 1, 'Min 1'),
  applicableKinds: z.array(z.string()).min(1, 'Pilih minimal 1 jenis'),
  minAmount: z.string(),
}) satisfies z.ZodType<PromoForm>;

const DISCOUNT_TYPE_OPTS = [
  { value: 'PERCENT', label: 'Persentase (%)' },
  { value: 'FIXED', label: 'Nominal Tetap (Rp)' },
];

export default function AdminPromoPage() {
  const methods = useForm<PromoForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      discountType: 'PERCENT',
      discountValue: '10',
      validUntil: '',
      maxUses: '100',
      applicableKinds: [],
      minAmount: '',
    },
  });

  const discountType = methods.watch('discountType');

  const create = useMutation({
    mutationFn: async (values: PromoForm) => {
      const body = {
        code: values.code.trim().toUpperCase(),
        discountType: values.discountType,
        discountValue: Number(values.discountValue),
        validUntil: new Date(values.validUntil).toISOString(),
        maxUses: Number(values.maxUses),
        applicableKinds: values.applicableKinds,
        minAmount: values.minAmount ? Number(values.minAmount) : undefined,
      };
      const res = await api.post('/admin/promo-codes', body);
      return res.data;
    },
    onSuccess: () => {
      notifySuccess('Kode promo dibuat');
      methods.reset({
        code: '',
        discountType: 'PERCENT',
        discountValue: '10',
        validUntil: '',
        maxUses: '100',
        applicableKinds: [],
        minAmount: '',
      });
    },
    onError: (e) => notifyAxiosError(e, 'Gagal membuat kode promo'),
  });

  const onSubmit = methods.handleSubmit((values) => create.mutate(values));

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={Sparkles}
        title='Kode Promo'
        description='Buat kode diskon untuk sesi, langganan, atau featured.'
      />

      <Card className='max-w-2xl'>
        <CardHeader>
          <CardTitle>Buat Kode Promo</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={onSubmit} className='space-y-4'>
              <TextField<PromoForm>
                name='code'
                label='Kode'
                placeholder='WELCOME10'
                helperText='Otomatis di-uppercase saat disimpan.'
              />

              <div className='grid gap-4 sm:grid-cols-2'>
                <SelectField<PromoForm>
                  name='discountType'
                  label='Tipe Diskon'
                  options={DISCOUNT_TYPE_OPTS}
                  className='w-full'
                />
                <TextField<PromoForm>
                  name='discountValue'
                  label={
                    discountType === 'PERCENT' ? 'Nilai (%)' : 'Nilai (Rp)'
                  }
                  type='number'
                  min={1}
                />
              </div>

              <div className='grid gap-4 sm:grid-cols-2'>
                <TextField<PromoForm>
                  name='validUntil'
                  label='Berlaku sampai'
                  type='date'
                />
                <TextField<PromoForm>
                  name='maxUses'
                  label='Maks. penggunaan'
                  type='number'
                  min={1}
                />
              </div>

              <MultiToggleField<PromoForm>
                name='applicableKinds'
                label='Berlaku untuk'
                options={PAYMENT_KIND_OPTIONS}
                helperText='Pilih jenis pembayaran yang dapat memakai kode ini.'
              />

              <TextField<PromoForm>
                name='minAmount'
                label='Minimum transaksi (Rp, opsional)'
                type='number'
                min={0}
                placeholder='100000'
                helperText='Kosongkan jika tidak ada minimum.'
              />

              <Button
                type='submit'
                size='lg'
                disabled={create.isPending}
                className='w-full'
              >
                {create.isPending ? 'Menyimpan...' : 'Buat Kode'}
              </Button>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
