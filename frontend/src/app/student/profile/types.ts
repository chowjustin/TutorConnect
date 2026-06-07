import type { Subject } from '@/types/shared';

export interface StudentProfile {
  id: string;
  userId: string;
  bio: string | null;
  interests: Subject[];
  school: string | null;
  whatsappNumber: string | null;
}

export interface StudentProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: 'STUDENT';
  };
  profile: StudentProfile;
}

export interface StudentProfileForm {
  bio: string;
  school: string;
  whatsappNumber: string;
  interests: Subject[];
}

export interface UpdateStudentRequest {
  bio?: string;
  school?: string;
  whatsappNumber?: string;
  interests?: Subject[];
}
