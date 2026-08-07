/**
 * هدف فایل: خواندن و نوشتن کنترل‌شده LocalStorage با مدیریت خطای فارسی.
 * جایگاه معماری: هوک shared برای تنظیمات و وضعیت‌های سبک کلاینتی.
 */
import { useCallback, useState } from 'react';

import { AppError } from '@/shared/api/api-error';

interface LocalStorageState<T> {
  readonly value: T;
  readonly setValue: (value: T) => void;
  readonly error: AppError | null;
}

/**
 * مقدار LocalStorage را با fallback امن مدیریت می‌کند.
 *
 * @param key - کلید LocalStorage.
 * @param initialValue - مقدار پیش‌فرض در نبود داده ذخیره‌شده.
 * @returns مقدار، setter و آخرین خطای ذخیره‌سازی.
 * @example
 * const state = useLocalStorage('ftf:key', 'value');
 */
export function useLocalStorage<T>(key: string, initialValue: T): LocalStorageState<T> {
  const [error, setError] = useState<AppError | null>(null);
  const [value, setStoredValue] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue === null ? initialValue : (JSON.parse(storedValue) as T);
    } catch (cause) {
      setError(AppError.validation('خواندن تنظیمات ذخیره‌شده ناموفق بود.', { key, cause }));
      return initialValue;
    }
  });

  const setValue = useCallback(
    (nextValue: T): void => {
      try {
        localStorage.setItem(key, JSON.stringify(nextValue));
        setStoredValue(nextValue);
        setError(null);
      } catch (cause) {
        setError(AppError.validation('ذخیره تنظیمات در مرورگر ناموفق بود.', { key, cause }));
      }
    },
    [key],
  );

  return { value, setValue, error };
}
