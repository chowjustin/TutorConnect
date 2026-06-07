'use client';

import * as React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/form/text-field';
import { TextareaField } from '@/components/form/textarea-field';

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
    resolver: zodResolver(tutorProfileFormSchema),
    defaultValues: {
      bio: '',
      hourlyRate: '',
      whatsappNumber: '',
      educationBackground: '',
      experience: '',
      bankName: '',
      bankAccountNumber: '',
      bankAccountHolder: '',
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
      bankName: profile.bankName ?? '',
      bankAccountNumber: profile.bankAccountNumber ?? '',
      bankAccountHolder: profile.bankAccountHolder ?? '',
    });
  }, [profile, methods]);

  const update = useUpdateTutorProfile(profile?.id);

  const onSubmit = methods.handleSubmit((values) => {
    const req: UpdateTutorRequest = {
      bio: values.bio || undefined,
      hourlyRate: values.hourlyRate ? Number(values.hourlyRate) : undefined,
      whatsappNumber: values.whatsappNumber || undefined,
      educationBackground: values.educationBackground || undefined,
      bankName: values.bankName || undefined,
      bankAccountNumber: values.bankAccountNumber || undefined,
      bankAccountHolder: values.bankAccountHolder || undefined,
    };
    update.mutate(req);
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className='space-y-4'>
        <TextareaField<TutorProfileForm>
          name='bio'
          label='Bio'
          rows={5}
          placeholder='Ceritakan pengalaman dan pendekatan mengajar Anda'
        />
        <div className='grid gap-3 sm:grid-cols-2'>
          <TextField<TutorProfileForm>
            name='hourlyRate'
            label='Tarif per jam (IDR)'
            placeholder='150000'
          />
          <TextField<TutorProfileForm>
            name='whatsappNumber'
            label='WhatsApp'
            placeholder='08xxxxxxxxxx'
          />
        </div>
        <TextareaField<TutorProfileForm>
          name='educationBackground'
          label='Latar belakang pendidikan'
          rows={3}
        />
        <TextField<TutorProfileForm>
          name='experience'
          label='Pengalaman (tahun)'
          placeholder='3'
        />
        <h3 className='h4 pt-2'>Rekening Bank</h3>
        <div className='grid gap-3 sm:grid-cols-3'>
          <TextField<TutorProfileForm> name='bankName' label='Nama bank' />
          <TextField<TutorProfileForm>
            name='bankAccountNumber'
            label='Nomor rekening'
          />
          <TextField<TutorProfileForm>
            name='bankAccountHolder'
            label='Atas nama'
          />
        </div>
        <Button type='submit' disabled={update.isPending}>
          {update.isPending ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </form>
    </FormProvider>
  );
}
