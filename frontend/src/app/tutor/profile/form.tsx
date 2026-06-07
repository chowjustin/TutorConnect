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

export function TutorProfileFormView({ profile }: Props) {
  const methods = useForm<TutorProfileForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(tutorProfileFormSchema as any) as Resolver<TutorProfileForm>,
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
      <form onSubmit={onSubmit} className='space-y-6'>
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
        <div>
          <h3 className='h4 mb-3'>Rekening Bank</h3>
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
        </div>
        <Button type='submit' disabled={update.isPending}>
          {update.isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </form>
    </FormProvider>
  );
}
