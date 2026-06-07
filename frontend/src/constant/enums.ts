import type {
  EducationLevel,
  Subject,
  TeachingMethod,
} from '@/types/shared';

export const SUBJECT_OPTIONS: { value: Subject; label: string }[] = [
  { value: 'MATH', label: 'Matematika' },
  { value: 'PHYSICS', label: 'Fisika' },
  { value: 'CHEMISTRY', label: 'Kimia' },
  { value: 'ENGLISH', label: 'Bahasa Inggris' },
  { value: 'COMPUTER_SCIENCE', label: 'Ilmu Komputer' },
  { value: 'ECONOMICS', label: 'Ekonomi' },
  { value: 'ACCOUNTING', label: 'Akuntansi' },
];

export const EDUCATION_LEVEL_OPTIONS: {
  value: EducationLevel;
  label: string;
}[] = [
  { value: 'JUNIOR_HIGH', label: 'SMP' },
  { value: 'SENIOR_HIGH', label: 'SMA' },
  { value: 'UNIVERSITY', label: 'Universitas' },
];

export const TEACHING_METHOD_OPTIONS: {
  value: TeachingMethod;
  label: string;
}[] = [
  { value: 'VISUAL', label: 'Visual' },
  { value: 'DISCUSSION', label: 'Diskusi' },
  { value: 'INTENSIVE', label: 'Intensif' },
  { value: 'STRUCTURED', label: 'Terstruktur' },
];
