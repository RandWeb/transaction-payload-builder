/**
 * هدف فایل: کپی متن در Clipboard با fallback و پیام خطای فارسی.
 * جایگاه معماری: هوک shared برای CopyButton و خروجی‌های JSON.
 */
import { useCallback, useState } from 'react';

import { AppError } from '@/shared/api/api-error';

interface CopyState {
  readonly copied: boolean;
  readonly error: AppError | null;
  readonly copy: (text: string) => Promise<boolean>;
}

/**
 * متن را با Clipboard API یا fallback مبتنی بر textarea کپی می‌کند.
 *
 * @returns وضعیت کپی، خطا و تابع async کپی.
 * @example
 * const { copy } = useCopyToClipboard();
 */
export function useCopyToClipboard(): CopyState {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard !== undefined) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.append(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      setCopied(true);
      setError(null);
      window.setTimeout(() => setCopied(false), 1500);
      return true;
    } catch (cause) {
      setCopied(false);
      setError(AppError.validation('کپی متن در Clipboard ناموفق بود.', { cause }));
      return false;
    }
  }, []);

  return { copied, error, copy };
}
