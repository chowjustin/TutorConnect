import { z } from 'zod';

import type { TutorProfileForm } from './types';

export const tutorProfileFormSchema = z.object({
  bio: z.string().max(2000, 'Maks 2000 karakter'),
  hourlyRate: z.string().regex(/^\d*$/u, 'Hanya angka'),
  whatsappNumber: z.string().regex(/^[0-9+\-\s]*$/u, 'Format tidak valid'),
  educationBackground: z.string().max(1000),
  experience: z.string().regex(/^\d*$/u, 'Hanya angka'),
  bankName: z.string(),
  bankAccountNumber: z.string(),
  bankAccountHolder: z.string(),
}) satisfies z.ZodType<TutorProfileForm>;
