import { z } from 'zod';

import type { RegisterStudentForm } from './types';

export const registerStudentFormSchema = z
  .object({
    name: z.string().min(2, 'Nama minimal 2 karakter'),
    email: z.string().email('Email tidak valid'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    passwordConfirm: z.string(),
    phoneNumber: z
      .string()
      .min(8, 'Nomor telepon tidak valid')
      .regex(/^[0-9+\-\s]+$/u, 'Hanya angka dan + - spasi'),
    whatsappNumber: z.string().optional().default(''),
    referralCode: z.string().optional().default(''),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Konfirmasi password tidak cocok',
  }) satisfies z.ZodType<RegisterStudentForm>;
