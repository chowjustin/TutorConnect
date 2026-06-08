import type {
  EducationLevel,
  Subject,
  TeachingMethod,
  VerificationStatus,
} from '@/types/shared';

export interface TutorProfile {
  id: string;
  userId: string;
  bio: string | null;
  hourlyRate: number | null;
  whatsappNumber: string | null;
  subjects: Subject[];
  educationLevels: EducationLevel[];
  teachingMethods: TeachingMethod[];
  educationBackground: string | null;
  experience: number | null;
  introVideoUrl: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankAccountHolder: string | null;
  verificationStatus: VerificationStatus;
  publishedAt: string | null;
  verifiedAt: string | null;
  idDocumentUrl: string | null;
  educationProofUrl: string | null;
}

export interface TutorProfileResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: 'TUTOR';
  };
  profile: TutorProfile;
}

export interface TutorProfileForm {
  bio: string;
  hourlyRate: string;
  whatsappNumber: string;
  educationBackground: string;
  experience: string;
  introVideoUrl: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  subjects: Subject[];
  educationLevels: EducationLevel[];
  teachingMethods: TeachingMethod[];
}

export interface UpdateTutorRequest {
  bio?: string;
  experience?: number;
  hourlyRate?: number;
  whatsappNumber?: string;
  educationBackground?: string;
  introVideoUrl?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  subjects?: Subject[];
  educationLevels?: EducationLevel[];
  teachingMethods?: TeachingMethod[];
}

export interface CompletenessResponse {
  score: number;
  missing: string[];
  minRequired: number;
}
