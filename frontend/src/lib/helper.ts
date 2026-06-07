// ---------- TypeScript helper types ----------------------------------------

export type ExtractProps<C> = C extends React.ComponentType<infer P> ? P : never;

export type Merge<A, B> = Omit<A, keyof B> & B;

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

// Dotted-path keys into a nested object (one level deep is enough for RHF use).
export type Paths<T, Prev extends string = ''> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? `${Prev}${K}` | `${Prev}${K}.${Paths<T[K], ''>}`
        : `${Prev}${K}`;
    }[keyof T & string]
  : never;

// ---------- SSR-safe storage helpers ---------------------------------------

export function getFromLocalStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(key);
}

export function setToLocalStorage(key: string, value: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, value);
}

export function getFromSessionStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(key);
}

export function setToSessionStorage(key: string, value: string) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(key, value);
}

// React import for ExtractProps typing
import type * as React from 'react';
export type { React };
