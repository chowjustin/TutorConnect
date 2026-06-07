import { z } from 'zod';

import type { StudentProfileForm } from './types';

export const studentProfileFormSchema: z.ZodType<StudentProfileForm> =
  z.object({
    bio: z.string().max(1000, 'Maks 1000 karakter'),
    school: z.string().max(200),
    whatsappNumber: z.string().regex(/^[0-9+\-\s]*$/u, 'Format tidak valid'),
    interests: z.array(z.string()),
  }) as unknown as z.ZodType<StudentProfileForm>;
