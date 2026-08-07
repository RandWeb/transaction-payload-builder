/**
 * هدف فایل: مدیریت تم روشن، تاریک و سیستم با ذخیره‌سازی امن در LocalStorage.
 * جایگاه معماری: هوک shared برای استفاده در Provider ها و کامپوننت‌های UI.
 */
import type { ReactNode } from 'react';
import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AppError } from '@/shared/api/api-error';

export type ThemeMode = 'light' | 'dark' | 'system';

type AppliedTheme = 'light' | 'dark';

interface ThemeContextValue {
  readonly mode: ThemeMode;
  readonly appliedTheme: AppliedTheme;
  readonly setMode: (mode: ThemeMode) => void;
}

const THEME_STORAGE_KEY = 'ftf:theme';
const themeModes = ['light', 'dark', 'system'] as const;

export const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * مقدار LocalStorage را با لیست حالت‌های مجاز تطبیق می‌دهد.
 *
 * @param value - مقدار خام خوانده‌شده از LocalStorage.
 * @returns حالت معتبر تم یا مقدار پیش‌فرض system.
 */
function parseThemeMode(value: string | null): ThemeMode {
  return themeModes.find((mode) => mode === value) ?? 'system';
}

/**
 * تم ترجیحی سیستم را از Media Query مرورگر استخراج می‌کند.
 *
 * @returns تم اعمال‌شده بر اساس تنظیمات سیستم.
 */
function getSystemTheme(): AppliedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * تم نهایی را روی ریشه سند اعمال می‌کند تا Tailwind و CSS Variables همگام شوند.
 *
 * @param appliedTheme - تم روشن یا تاریک محاسبه‌شده.
 * @returns void
 */
function applyThemeToDocument(appliedTheme: AppliedTheme): void {
  document.documentElement.classList.toggle('dark', appliedTheme === 'dark');
  document.documentElement.style.colorScheme = appliedTheme;
}

/**
 * مقداردهنده Provider تم برای کل برنامه.
 *
 * @param props - children قابل نمایش درون Provider.
 * @returns Provider آماده برای استفاده در لایه app.
 * @example
 * <ThemeProvider><App /></ThemeProvider>
 */
export function ThemeProvider({ children }: { readonly children: ReactNode }): React.ReactElement {
  const [mode, setModeState] = useState<ThemeMode>(() => parseThemeMode(localStorage.getItem(THEME_STORAGE_KEY)));
  const [systemTheme, setSystemTheme] = useState<AppliedTheme>(() => getSystemTheme());
  const appliedTheme = mode === 'system' ? systemTheme : mode;

  const setMode = useCallback((nextMode: ThemeMode): void => {
    localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    setModeState(nextMode);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (): void => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    applyThemeToDocument(appliedTheme);
  }, [appliedTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, appliedTheme, setMode }),
    [appliedTheme, mode, setMode],
  );

  return createElement(ThemeContext.Provider, { value }, children);
}

/**
 * دسترسی کنترل‌شده به وضعیت تم را برای کامپوننت‌ها فراهم می‌کند.
 *
 * @returns وضعیت فعلی، تم اعمال‌شده و تابع تغییر تم.
 * @throws AppError اگر خارج از ThemeProvider استفاده شود.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new AppError({
      code: 'UNKNOWN',
      messageFa: 'هوک تم خارج از محدوده Provider استفاده شده است.',
    });
  }

  return context;
}
