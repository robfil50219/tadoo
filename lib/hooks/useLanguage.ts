'use client';

import { useCallback, useEffect } from 'react';
import { create } from 'zustand';
import {
  defaultLanguage,
  languageLocales,
  languageOptions,
  translations,
  type AppLanguage,
} from '@/lib/i18n/translations';

export type { AppLanguage };

type TranslationValues = Record<string, string | number>;

const languageStorageKey = 'tadoo-language';

const isAppLanguage = (value: unknown): value is AppLanguage =>
  value === 'en' || value === 'no' || value === 'sv' || value === 'da';

const readStoredLanguage = (): AppLanguage | null => {
  if (typeof window === 'undefined') return null;

  const stored = window.localStorage.getItem(languageStorageKey);
  if (!stored) return null;
  if (isAppLanguage(stored)) return stored;

  try {
    const parsed = JSON.parse(stored) as { state?: { language?: unknown }; language?: unknown };
    if (isAppLanguage(parsed.language)) return parsed.language;
    if (isAppLanguage(parsed.state?.language)) return parsed.state.language;
  } catch {
    return null;
  }

  return null;
};

const writeStoredLanguage = (language: AppLanguage) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(languageStorageKey, language);
};

interface LanguageStoreState {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
}

const useLanguageStore = create<LanguageStoreState>()((set) => ({
  language: defaultLanguage,
  setLanguage: (language) => {
    writeStoredLanguage(language);
    set({ language });
  },
}));

const interpolate = (value: string, replacements?: TranslationValues) => {
  if (!replacements) return value;

  return Object.entries(replacements).reduce(
    (text, [key, replacement]) => text.split(`{{${key}}}`).join(String(replacement)),
    value
  );
};

export function useLanguage() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  useEffect(() => {
    const storedLanguage = readStoredLanguage();
    if (storedLanguage && storedLanguage !== useLanguageStore.getState().language) {
      useLanguageStore.getState().setLanguage(storedLanguage);
    }
  }, []);

  const t = useCallback(
    (key: string, replacements?: TranslationValues): string => {
      const translated = translations[language][key] || translations.en[key] || key;
      return interpolate(translated, replacements);
    },
    [language]
  );

  return {
    language,
    languageOptions,
    locale: languageLocales[language],
    setLanguage,
    t,
  };
}
