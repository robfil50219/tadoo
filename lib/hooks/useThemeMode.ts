'use client';

import { useCallback, useEffect } from 'react';
import { create } from 'zustand';

export type ThemeMode = 'day' | 'night';

const themeModeStorageKey = 'tadoo-theme-mode';
const defaultThemeMode: ThemeMode = 'day';

const isThemeMode = (value: unknown): value is ThemeMode => value === 'day' || value === 'night';

const readStoredThemeMode = (): ThemeMode | null => {
  if (typeof window === 'undefined') return null;

  const stored = window.localStorage.getItem(themeModeStorageKey);
  if (!stored) return null;
  if (isThemeMode(stored)) return stored;

  try {
    const parsed = JSON.parse(stored) as { state?: { themeMode?: unknown }; themeMode?: unknown };
    if (isThemeMode(parsed.themeMode)) return parsed.themeMode;
    if (isThemeMode(parsed.state?.themeMode)) return parsed.state.themeMode;
  } catch {
    return null;
  }

  return null;
};

const writeStoredThemeMode = (themeMode: ThemeMode) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(themeModeStorageKey, themeMode);
};

interface ThemeModeStoreState {
  themeMode: ThemeMode;
  setThemeMode: (themeMode: ThemeMode) => void;
}

const useThemeModeStore = create<ThemeModeStoreState>()((set) => ({
  themeMode: defaultThemeMode,
  setThemeMode: (themeMode) => {
    writeStoredThemeMode(themeMode);
    set({ themeMode });
  },
}));

export function useThemeMode() {
  const themeMode = useThemeModeStore((state) => state.themeMode);
  const setThemeMode = useThemeModeStore((state) => state.setThemeMode);

  useEffect(() => {
    const storedThemeMode = readStoredThemeMode();
    if (storedThemeMode && storedThemeMode !== useThemeModeStore.getState().themeMode) {
      useThemeModeStore.getState().setThemeMode(storedThemeMode);
    }
  }, []);

  const toggleThemeMode = useCallback(() => {
    const nextThemeMode = useThemeModeStore.getState().themeMode === 'night' ? 'day' : 'night';
    setThemeMode(nextThemeMode);
  }, [setThemeMode]);

  return {
    themeMode,
    isNight: themeMode === 'night',
    setThemeMode,
    toggleThemeMode,
  };
}
