import {
  CalendarDays,
  CreditCard,
  FileText,
  Gift,
  LayoutDashboard,
  ListChecks,
  PiggyBank,
  Receipt,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  User,
  UserCheck,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

import type { Role } from '@/types/shared';

export interface SidebarEntry {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const SIDEBAR_ENTRIES: Record<Role, SidebarEntry[]> = {
  TUTOR: [
    { label: 'Dashboard', href: '/tutor', icon: LayoutDashboard },
    { label: 'Profil', href: '/tutor/profile', icon: User },
    { label: 'Verifikasi', href: '/tutor/verification', icon: ShieldCheck },
    { label: 'Ketersediaan', href: '/tutor/availability', icon: CalendarDays },
    { label: 'Aplikasi', href: '/tutor/applications', icon: ListChecks },
    { label: 'Sesi', href: '/tutor/sessions', icon: CalendarDays },
    { label: 'Materi', href: '/tutor/materials', icon: FileText },
    { label: 'Dompet', href: '/tutor/wallet', icon: Wallet },
    { label: 'Pencairan', href: '/tutor/payouts', icon: PiggyBank },
    { label: 'Ulasan', href: '/tutor/reviews', icon: Star },
    { label: 'Langganan', href: '/tutor/subscription', icon: CreditCard },
    { label: 'Featured', href: '/tutor/featured', icon: Sparkles },
    { label: 'Referral', href: '/tutor/referrals', icon: Gift },
  ],
  STUDENT: [
    { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { label: 'Profil', href: '/student/profile', icon: User },
    { label: 'Cari Tutor', href: '/student/tutors', icon: Search },
    { label: 'Aplikasi', href: '/student/applications', icon: ListChecks },
    { label: 'Sesi', href: '/student/sessions', icon: CalendarDays },
    { label: 'Materi', href: '/student/materials', icon: FileText },
    { label: 'Pembayaran', href: '/student/payments', icon: Receipt },
    { label: 'Langganan', href: '/student/subscription', icon: CreditCard },
    { label: 'Referral', href: '/student/referrals', icon: Gift },
  ],
  ADMIN: [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    {
      label: 'Verifikasi Tutor',
      href: '/admin/tutors/verifications',
      icon: UserCheck,
    },
    { label: 'Pembayaran', href: '/admin/payments', icon: Receipt },
    { label: 'Pencairan', href: '/admin/payouts', icon: PiggyBank },
    {
      label: 'Rekening Platform',
      href: '/admin/platform-bank',
      icon: ShieldCheck,
    },
    { label: 'Promo', href: '/admin/promo', icon: Sparkles },
    { label: 'Featured', href: '/admin/featured', icon: Sparkles },
    { label: 'Referral', href: '/admin/referrals', icon: Gift },
    { label: 'Pengguna', href: '/admin/users', icon: Users },
  ],
};
