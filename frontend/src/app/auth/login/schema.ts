import { z } from 'zod';

import type { LoginForm } from './types';

export const loginFormSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
}) satisfies z.ZodType<LoginForm>;
