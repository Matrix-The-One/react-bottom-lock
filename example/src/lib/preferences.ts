import type { Locale } from './i18n';

export type DemoTheme = 'light' | 'dark';

export function detectPreferredTheme(): DemoTheme {
  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }

  return 'light';
}

export function detectPreferredLocale(): Locale {
  if (typeof navigator === 'undefined') {
    return 'en';
  }

  const languages = [
    ...new Set([...(navigator.languages ?? []), navigator.language].filter(Boolean)),
  ];

  for (const language of languages) {
    const normalized = language.toLowerCase();

    if (normalized.startsWith('zh')) {
      return 'zh';
    }
  }

  for (const language of languages) {
    const normalized = language.toLowerCase();

    if (normalized.startsWith('en')) {
      return 'en';
    }
  }

  return 'en';
}
