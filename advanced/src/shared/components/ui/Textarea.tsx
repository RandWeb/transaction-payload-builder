/**
 * هدف فایل: textarea پایه با label، hint، خطا و شمارنده اختیاری.
 * جایگاه معماری: shared/ui برای فرم‌ها و ادیتورهای ساده.
 */
import { forwardRef, useId } from 'react';
import type { TextareaHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly label?: string;
  readonly hint?: string;
  readonly error?: string;
  readonly showCount?: boolean;
}

/**
 * ناحیه متنی استاندارد با وضعیت خطا و شمارنده کاراکتر.
 *
 * @param props - ویژگی‌های textarea و داده‌های نمایشی فرم.
 * @returns textarea قابل دسترس و RTL.
 * @example
 * <Textarea label="توضیحات" showCount maxLength={200} />
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { id, label, hint, error, required, showCount = false, value, maxLength, className, ...props },
  ref,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const hintId = hint === undefined ? undefined : `${textareaId}-hint`;
  const errorId = error === undefined ? undefined : `${textareaId}-error`;
  const count = typeof value === 'string' ? value.length : 0;

  return (
    <div className="space-y-2">
      {label !== undefined ? <label htmlFor={textareaId} className="block text-sm font-medium">{label}</label> : null}
      <textarea
        ref={ref}
        id={textareaId}
        className={cn(
          'min-h-28 w-full resize-y rounded-xl border border-border bg-surface px-3 py-2 text-text outline-none transition placeholder:text-secondary focus:ring-2 focus:ring-primary',
          error !== undefined && 'border-error focus:ring-error',
          className,
        )}
        required={required}
        value={value}
        maxLength={maxLength}
        aria-invalid={error !== undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        {...props}
      />
      <div className="flex items-center justify-between gap-3 text-xs">
        {hint !== undefined ? <p id={hintId} className="text-secondary">{hint}</p> : <span />}
        {showCount ? <span className="text-secondary">{maxLength === undefined ? count : `${count}/${maxLength}`}</span> : null}
      </div>
      {error !== undefined ? <p id={errorId} className="text-xs text-error">{error}</p> : null}
    </div>
  );
});
