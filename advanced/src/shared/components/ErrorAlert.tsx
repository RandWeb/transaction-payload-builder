/**
 * هدف فایل: نمایش خطاهای AppError با پیام فارسی و جزئیات اختیاری.
 * جایگاه معماری: shared/components و نقطه نمایش استاندارد خطا در UI.
 */
import { AlertCircle } from 'lucide-react';

import type { AppError } from '@/shared/api/api-error';
import { Button } from '@/shared/components/ui/Button';

export interface ErrorAlertProps {
  readonly error: AppError;
  readonly onRetry?: () => void;
}

/**
 * خطای برنامه را بدون stack trace و با کد قابل پیگیری نمایش می‌دهد.
 *
 * @param props - خطا و اکشن تلاش مجدد اختیاری.
 * @returns Alert دسترس‌پذیر فارسی.
 * @example
 * <ErrorAlert error={error} onRetry={retry} />
 */
export function ErrorAlert({ error, onRetry }: ErrorAlertProps): JSX.Element {
  return (
    <div role="alert" className="rounded-xl border border-error bg-[rgb(var(--color-bg-danger-subtle))] p-4 text-error">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-1 size-5 shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <p className="font-semibold">{error.messageFa}</p>
          <p className="mt-1 text-xs">کد خطا: {error.code}</p>
          {error.details !== undefined ? <details className="mt-3 text-xs"><summary>جزئیات</summary><pre className="mt-2 overflow-auto whitespace-pre-wrap" dir="ltr">{JSON.stringify(error.details, null, 2)}</pre></details> : null}
          {onRetry !== undefined ? <Button type="button" className="mt-4" variant="outline" size="sm" onClick={onRetry}>تلاش مجدد</Button> : null}
        </div>
      </div>
    </div>
  );
}
