import type { User } from '@/types/shared';

export interface LoginForm {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: Pick<User, 'id' | 'email' | 'name' | 'role'>;
}
