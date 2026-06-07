'use client';

import * as React from 'react';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { TextField } from '@/components/form/text-field';
import { TextareaField } from '@/components/form/textarea-field';
import { MultiToggleField } from '@/components/form/multi-toggle-field';
import { SUBJECT_OPTIONS } from '@/constant/enums';

import { useStudentProfile } from './hooks/query';
import { useUpdateStudentProfile } from './hooks/mutation';
import { studentProfileFormSchema } from './schema';
import type { StudentProfileForm, UpdateStudentRequest } from './types';

export default function StudentProfilePage() {
  const profileQ = useStudentProfile();
  const update = useUpdateStudentProfile(profileQ.data?.profile.id);

  const methods = useForm<StudentProfileForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(studentProfileFormSchema as any) as Resolver<StudentProfileForm>,
    defaultValues: {
      bio: '',
      school: '',
      whatsappNumber: '',
      interests: [],
    },
  });

  React.useEffect(() => {
    const p = profileQ.data?.profile;
    if (!p) return;
    methods.reset({
      bio: p.bio ?? '',
      school: p.school ?? '',
      whatsappNumber: p.whatsappNumber ?? '',
      interests: p.interests ?? [],
    });
  }, [profileQ.data, methods]);

  const onSubmit = methods.handleSubmit((values) => {
    const req: UpdateStudentRequest = {
      bio: values.bio || undefined,
      school: values.school || undefined,
      whatsappNumber: values.whatsappNumber || undefined,
      interests: values.interests,
    };
    update.mutate(req);
  });

  return (
    <div className='space-y-6'>
      <PageHeader
        icon={User}
        title='Profil Siswa'
        description='Lengkapi profil agar tutor mengenal Anda lebih baik.'
      />
      <Card className='hover:shadow-md hover:shadow-primary-500/5 transition-shadow'>
        <CardHeader>
          <CardTitle>Informasi Dasar</CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...methods}>
            <form onSubmit={onSubmit} className='space-y-4'>
              <TextareaField<StudentProfileForm>
                name='bio'
                label='Bio'
                rows={4}
                placeholder='Ceritakan sedikit tentang diri Anda...'
              />
              <div className='grid gap-4 sm:grid-cols-2'>
                <TextField<StudentProfileForm>
                  name='school'
                  label='Sekolah / Universitas'
                  placeholder='Misal: SMA Negeri 1 Jakarta'
                />
                <TextField<StudentProfileForm>
                  name='whatsappNumber'
                  label='Nomor WhatsApp'
                  placeholder='08xxxxxxxxxx'
                />
              </div>
              <MultiToggleField<StudentProfileForm>
                name='interests'
                label='Mata Pelajaran Diminati'
                options={SUBJECT_OPTIONS}
                helperText='Pilih satu atau lebih.'
              />
              <Button type='submit' disabled={update.isPending}>
                {update.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
