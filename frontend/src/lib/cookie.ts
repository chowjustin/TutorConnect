import Cookies from 'universal-cookie';

const ACCESS = 'dbb_token';
const REFRESH = 'dbb_refresh';

const cookies = () => new Cookies(null, { path: '/' });

const isBrowser = typeof window !== 'undefined';

export function getToken(): string | undefined {
  if (!isBrowser) return undefined;
  return cookies().get<string | undefined>(ACCESS);
}

export function setToken(token: string) {
  if (!isBrowser) return;
  cookies().set(ACCESS, token, { path: '/', sameSite: 'lax' });
}

export function removeToken() {
  if (!isBrowser) return;
  cookies().remove(ACCESS, { path: '/' });
}

export function getRefreshToken(): string | undefined {
  if (!isBrowser) return undefined;
  return cookies().get<string | undefined>(REFRESH);
}

export function setRefreshToken(token: string) {
  if (!isBrowser) return;
  cookies().set(REFRESH, token, { path: '/', sameSite: 'lax' });
}

export function removeRefreshToken() {
  if (!isBrowser) return;
  cookies().remove(REFRESH, { path: '/' });
}

export function clearTokens() {
  removeToken();
  removeRefreshToken();
}

/**
 * Read access token from a request header string (SSR).
 * Pass `headers().get('cookie')` from a Server Component.
 */
export function getTokenFromCookieHeader(
  cookieHeader: string | null | undefined,
): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(';')) {
    const [k, v] = part.trim().split('=');
    if (k === ACCESS) return decodeURIComponent(v);
  }
  return undefined;
}
