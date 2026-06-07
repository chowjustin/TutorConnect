import { z } from 'zod';

import type { TutorProfileForm } from './types';

export const tutorProfileFormSchema = z.object({
  bio: z.string().max(2000, 'Maks 2000 karakter'),
  hourlyRate: z.string().regex(/^\d*$/u, 'Hanya angka'),
  whatsappNumber: z.string().regex(/^[0-9+\-\s]*$/u, 'Format tidak valid'),
  educationBackground: z.string().max(1000),
  experience: z.string().regex(/^\d*$/u, 'Hanya angka'),
  introVideoUrl: z.string().url().or(z.literal('')),
  bankName: z.string(),
  bankAccountNumber: z.string(),
  bankAccountHolder: z.string(),
  subjects: z.array(z.string()),
  educationLevels: z.array(z.string()),
  teachingMethods: z.array(z.string()),
}) as unknown as z.ZodType<TutorProfileForm>;
