/**
 * هدف فایل: ترکیب امن کلاس‌های Tailwind و حذف تعارض کلاس‌ها.
 * جایگاه معماری: ابزار مشترک shared/lib برای همه کامپوننت‌های UI.
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * کلاس‌های شرطی را با منطق Tailwind Merge ترکیب می‌کند.
 *
 * @param inputs - لیست کلاس‌ها، آبجکت‌های شرطی یا آرایه‌های کلاس.
 * @returns رشته کلاس نهایی بدون تعارض Tailwind.
 * @example
 * cn('px-2', isActive && 'bg-primary')
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
