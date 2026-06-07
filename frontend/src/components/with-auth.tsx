'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { clearTokens, getToken } from '@/lib/cookie';
import { useGetUserDetail } from '@/hooks/use-get-user-detail';
import useAuthStore from '@/store/use-auth-store';
import Loading from '@/components/loading';
import type { User, Role } from '@/types/shared';

export interface WithAuthProps {
  user: User;
}

const TUTOR_HOME = '/tutor';
const STUDENT_HOME = '/student';
const ADMIN_HOME = '/admin';
const LOGIN_ROUTE = '/auth/login';

/**
 * RouteRole determines who may access the page.
 *
 * - `public`        : only when NOT authed; authed users redirect to their home
 * - `optional`      : accessible always; surfaces user if present
 * - `authenticated` : any logged-in user
 * - `tutor`         : TUTOR only; STUDENT/ADMIN bounce to their own home
 * - `student`       : STUDENT only
 * - `admin`         : ADMIN only
 */
export type RouteRole =
  | 'public'
  | 'optional'
  | 'authenticated'
  | 'tutor'
  | 'student'
  | 'admin';

const ROLE_HOME: Record<Role, string> = {
  TUTOR: TUTOR_HOME,
  STUDENT: STUDENT_HOME,
  ADMIN: ADMIN_HOME,
};

function homeForRole(role: Role | undefined): string {
  return role ? ROLE_HOME[role] : LOGIN_ROUTE;
}

export default function withAuth<P extends object>(
  Component: React.ComponentType<P & Partial<WithAuthProps>>,
  routeRole: RouteRole,
) {
  function ComponentWithAuth(props: P) {
    const router = useRouter();
    const pathName = usePathname();
    const redirect = React.useMemo(() => {
      if (typeof window === 'undefined') return undefined;
      const p = new URLSearchParams(window.location.search);
      return p.get('redirect') ?? undefined;
    }, []);

    const { refetch } = useGetUserDetail({ enabled: false });

    const isAuthed = useAuthStore.useIsAuthed();
    const isLoading = useAuthStore.useIsLoading();
    const login = useAuthStore.useLogin();
    const logout = useAuthStore.useLogout();
    const stopLoading = useAuthStore.useStopLoading();
    const user = useAuthStore.useUser();

    const checkAuth = React.useCallback(() => {
      const token = getToken();
      if (!token) {
        if (isAuthed) logout();
        stopLoading();
        return;
      }
      (async () => {
        try {
          const res = await refetch();
          const u = res.data;
          if (!u) {
            logout();
            return;
          }
          login(u);
        } catch {
          clearTokens();
          logout();
        } finally {
          stopLoading();
        }
      })();
    }, [isAuthed, login, logout, refetch, stopLoading]);

    React.useEffect(() => {
      checkAuth();
      const onFocus = () => checkAuth();
      window.addEventListener('focus', onFocus);
      return () => window.removeEventListener('focus', onFocus);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
      if (isLoading) return;

      if (isAuthed && user) {
        if (routeRole === 'public') {
          router.replace(redirect ?? homeForRole(user.role));
          return;
        }
        if (
          (routeRole === 'tutor' && user.role !== 'TUTOR') ||
          (routeRole === 'student' && user.role !== 'STUDENT') ||
          (routeRole === 'admin' && user.role !== 'ADMIN')
        ) {
          router.replace(homeForRole(user.role));
          return;
        }
      } else if (routeRole !== 'public' && routeRole !== 'optional') {
        router.replace(`${LOGIN_ROUTE}?redirect=${pathName ?? '/'}`);
      }
    }, [isAuthed, isLoading, pathName, redirect, router, user]);

    if (
      (isLoading || !isAuthed) &&
      routeRole !== 'public' &&
      routeRole !== 'optional'
    ) {
      return <Loading />;
    }

    return <Component {...(props as P)} user={user ?? undefined} />;
  }

  ComponentWithAuth.displayName = `withAuth(${
    Component.displayName ?? Component.name ?? 'Component'
  })`;

  return ComponentWithAuth;
}
