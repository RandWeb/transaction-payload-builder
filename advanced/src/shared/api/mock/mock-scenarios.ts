/**
 * هدف فایل: تعریف سناریوهای قابل انتخاب Mock API.
 * جایگاه معماری: shared/api/mock و قرارداد رفتاری شبیه‌ساز داخلی.
 */

export type MockScenario = 'success' | 'validation-error' | 'server-error' | 'timeout' | 'network-error' | 'slow';

const storageKey = 'ftf:mock-scenario';

/**
 * سناریوی Mock ذخیره‌شده در مرورگر یا env را برمی‌گرداند.
 *
 * @param fallback - سناریوی پیش‌فرض.
 * @returns سناریوی معتبر Mock.
 */
export function getMockScenario(fallback: MockScenario = 'success'): MockScenario {
  if (typeof window === 'undefined') return fallback;
  const storedValue = window.localStorage.getItem(storageKey);
  if (storedValue === 'success' || storedValue === 'validation-error' || storedValue === 'server-error' || storedValue === 'timeout' || storedValue === 'network-error' || storedValue === 'slow') {
    return storedValue;
  }
  return fallback;
}

/**
 * سناریوی Mock را برای صفحه تنظیمات یا تست‌ها ذخیره می‌کند.
 *
 * @param scenario - سناریوی انتخاب‌شده.
 */
export function setMockScenario(scenario: MockScenario): void {
  if (typeof window !== 'undefined') window.localStorage.setItem(storageKey, scenario);
}
