export const isProd = process.env.NODE_ENV === 'production';
export const isLocal = process.env.NODE_ENV === 'development';

export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export const showLogger = isLocal
  ? true
  : process.env.NEXT_PUBLIC_SHOW_LOGGER === 'true';

export const showSandbox = process.env.NEXT_PUBLIC_SHOW_SANDBOX === 'true';

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
