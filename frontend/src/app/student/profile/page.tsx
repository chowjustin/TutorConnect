'use client';

import * as React from 'react';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
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
    resolver: zodResolver(
      studentProfileFormSchema as any,
    ) as Resolver<StudentProfileForm>,
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
    <div className='border-primary-100 -mx-4 border-y bg-white md:mx-0 md:rounded-lg md:border'>
      <div className='mx-auto max-w-3xl p-6 md:p-10'>
        <div className='mb-8'>
          <h1 className='text-4xl font-semibold tracking-[-0.025em]'>
            Profil Siswa
          </h1>
          <p className='text-muted-foreground mt-1.5 text-base'>
            Lengkapi profil agar tutor mengenal Anda lebih baik.
          </p>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={onSubmit}>
            <section className='border-primary-100 border-b py-8 first:pt-0'>
              <header className='mb-6'>
                <h2 className='text-xl font-semibold'>Informasi Dasar</h2>
                <p className='text-muted-foreground mt-1 text-sm'>
                  Bio, sekolah, dan kontak yang tutor lihat.
                </p>
              </header>
              <div className='space-y-5'>
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
              </div>
            </section>

            <section className='border-primary-100 border-b py-8 last:border-b-0'>
              <header className='mb-6'>
                <h2 className='text-xl font-semibold'>Minat Belajar</h2>
                <p className='text-muted-foreground mt-1 text-sm'>
                  Pilih mata pelajaran yang ingin Anda pelajari.
                </p>
              </header>
              <MultiToggleField<StudentProfileForm>
                name='interests'
                label='Mata Pelajaran Diminati'
                options={SUBJECT_OPTIONS}
                helperText='Pilih satu atau lebih.'
              />
            </section>

            <div className='pt-6'>
              <Button type='submit' disabled={update.isPending}>
                {update.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
