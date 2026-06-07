import type { Role } from '@/types/shared';

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: Role;
  whatsappNumber?: string;
  referralCode?: string;
}

export interface RegisterResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };
}
