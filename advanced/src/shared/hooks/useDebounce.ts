/**
 * هدف فایل: کاهش فرکانس بروزرسانی مقدارهای جستجو و ورودی.
 * جایگاه معماری: هوک shared برای جلوگیری از محاسبات یا رندرهای غیرضروری.
 */
import { useEffect, useState } from 'react';

/**
 * مقدار ورودی را پس از تأخیر مشخص‌شده پایدار می‌کند.
 *
 * @param value - مقدار خام در حال تغییر.
 * @param delayMs - تأخیر بر حسب میلی‌ثانیه.
 * @returns مقدار debounce شده.
 * @example
 * const debouncedSearch = useDebounce(search, 300);
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [delayMs, value]);

  return debouncedValue;
}
