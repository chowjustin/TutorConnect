'use client';

import * as React from 'react';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/form/text-field';
import { TextareaField } from '@/components/form/textarea-field';
import { MultiToggleField } from '@/components/form/multi-toggle-field';
import {
  EDUCATION_LEVEL_OPTIONS,
  SUBJECT_OPTIONS,
  TEACHING_METHOD_OPTIONS,
} from '@/constant/enums';

import { tutorProfileFormSchema } from './schema';
import type {
  TutorProfile,
  TutorProfileForm,
  UpdateTutorRequest,
} from './types';
import { useUpdateTutorProfile } from './hooks/mutation';

interface Props {
  profile: TutorProfile | undefined;
}

function FormSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className='border-primary-100 scroll-mt-24 border-b py-10 first:pt-0 last:border-b-0'
    >
      <header className='mb-6'>
        <h2 className='text-foreground text-xl font-semibold'>{title}</h2>
        {description ? (
          <p className='text-muted-foreground mt-1 text-sm'>{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}

export function TutorProfileFormView({ profile }: Props) {
  const methods = useForm<TutorProfileForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(
      tutorProfileFormSchema as any,
    ) as Resolver<TutorProfileForm>,
    defaultValues: {
      bio: '',
      hourlyRate: '',
      whatsappNumber: '',
      educationBackground: '',
      experience: '',
      introVideoUrl: '',
      bankName: '',
      bankAccountNumber: '',
      bankAccountHolder: '',
      subjects: [],
      educationLevels: [],
      teachingMethods: [],
    },
  });

  React.useEffect(() => {
    if (!profile) return;
    methods.reset({
      bio: profile.bio ?? '',
      hourlyRate: profile.hourlyRate?.toString() ?? '',
      whatsappNumber: profile.whatsappNumber ?? '',
      educationBackground: profile.educationBackground ?? '',
      experience: profile.experience?.toString() ?? '',
      introVideoUrl: profile.introVideoUrl ?? '',
      bankName: profile.bankName ?? '',
      bankAccountNumber: profile.bankAccountNumber ?? '',
      bankAccountHolder: profile.bankAccountHolder ?? '',
      subjects: profile.subjects ?? [],
      educationLevels: profile.educationLevels ?? [],
      teachingMethods: profile.teachingMethods ?? [],
    });
  }, [profile, methods]);

  const update = useUpdateTutorProfile(profile?.id);

  const onSubmit = methods.handleSubmit((values) => {
    const req: UpdateTutorRequest = {
      bio: values.bio || undefined,
      hourlyRate: values.hourlyRate ? Number(values.hourlyRate) : undefined,
      whatsappNumber: values.whatsappNumber || undefined,
      educationBackground: values.educationBackground || undefined,
      introVideoUrl: values.introVideoUrl || undefined,
      bankName: values.bankName || undefined,
      bankAccountNumber: values.bankAccountNumber || undefined,
      bankAccountHolder: values.bankAccountHolder || undefined,
      subjects: values.subjects,
      educationLevels: values.educationLevels,
      teachingMethods: values.teachingMethods,
    };
    update.mutate(req);
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit}>
        <FormSection
          id='identitas'
          title='Identitas'
          description='Cerita singkat, kontak, dan tarif yang siswa lihat pertama kali.'
        >
          <div className='space-y-5'>
            <TextareaField<TutorProfileForm>
              name='bio'
              label='Bio'
              rows={5}
              placeholder='Ceritakan pengalaman dan pendekatan mengajar Anda'
            />
            <div className='grid gap-4 sm:grid-cols-2'>
              <TextField<TutorProfileForm>
                name='hourlyRate'
                label='Tarif per Jam (IDR)'
                placeholder='150000'
              />
              <TextField<TutorProfileForm>
                name='whatsappNumber'
                label='Nomor WhatsApp'
                placeholder='08xxxxxxxxxx'
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          id='pengajaran'
          title='Pengajaran'
          description='Mata pelajaran, jenjang, metode, dan latar belakang Anda.'
        >
          <div className='space-y-5'>
            <MultiToggleField<TutorProfileForm>
              name='subjects'
              label='Mata Pelajaran'
              options={SUBJECT_OPTIONS}
            />
            <MultiToggleField<TutorProfileForm>
              name='educationLevels'
              label='Jenjang yang Diajar'
              options={EDUCATION_LEVEL_OPTIONS}
            />
            <MultiToggleField<TutorProfileForm>
              name='teachingMethods'
              label='Metode Mengajar'
              options={TEACHING_METHOD_OPTIONS}
            />
            <TextareaField<TutorProfileForm>
              name='educationBackground'
              label='Latar Belakang Pendidikan'
              rows={3}
            />
            <div className='grid gap-4 sm:grid-cols-2'>
              <TextField<TutorProfileForm>
                name='experience'
                label='Pengalaman (tahun)'
                placeholder='3'
              />
              <TextField<TutorProfileForm>
                name='introVideoUrl'
                label='Video Perkenalan (URL, opsional)'
                placeholder='https://...'
              />
            </div>
          </div>
        </FormSection>

        <FormSection
          id='bank'
          title='Rekening Bank'
          description='Rekening untuk menerima pencairan saldo.'
        >
          <div className='grid gap-4 sm:grid-cols-3'>
            <TextField<TutorProfileForm> name='bankName' label='Nama Bank' />
            <TextField<TutorProfileForm>
              name='bankAccountNumber'
              label='Nomor Rekening'
            />
            <TextField<TutorProfileForm>
              name='bankAccountHolder'
              label='Atas Nama'
            />
          </div>
        </FormSection>

        <div className='border-primary-100 sticky bottom-0 -mx-6 mt-6 flex items-center justify-between border-t bg-white/95 px-6 py-4 backdrop-blur md:-mx-10 md:px-10'>
          <p className='text-muted-foreground text-xs'>
            Perubahan disimpan ke server saat Anda klik Simpan.
          </p>
          <Button type='submit' disabled={update.isPending}>
            {update.isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
