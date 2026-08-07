/**
 * هدف فایل: تنظیم عنوان تب مرورگر برای هر صفحه.
 * جایگاه معماری: هوک shared قابل استفاده در صفحات و layout ها.
 */
import { useEffect } from 'react';

import { appConfig } from '@/config/app-config';

/**
 * عنوان صفحه را با نام برنامه ترکیب و روی document اعمال می‌کند.
 *
 * @param title - عنوان فارسی صفحه.
 * @returns void
 * @example
 * useDocumentTitle('میز کار')
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = `${title} | ${appConfig.appName}`;
  }, [title]);
}
