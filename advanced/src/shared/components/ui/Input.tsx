/**
 * هدف فایل: ورودی متنی پایه با label، hint و خطای دسترس‌پذیر.
 * جایگاه معماری: shared/ui و سازگار با React Hook Form.
 */
import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string;
  readonly hint?: string;
  readonly error?: string;
}

/**
 * ورودی استاندارد با اتصال aria برای خطا و توضیح.
 *
 * @param props - ویژگی‌های input به‌همراه label، hint و error.
 * @returns فیلد ورودی قابل استفاده در فرم‌های RTL.
 * @example
 * <Input label="شناسه" error="شناسه الزامی است" />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, hint, error, required, className, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint === undefined ? undefined : `${inputId}-hint`;
  const errorId = error === undefined ? undefined : `${inputId}-error`;

  return (
    <div className="space-y-2">
      {label !== undefined ? (
        <label className="block text-sm font-medium text-text" htmlFor={inputId}>
          {label}
          {required === true ? <span className="text-error"> *</span> : null}
        </label>
      ) : null}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 text-text outline-none transition placeholder:text-secondary focus:ring-2 focus:ring-primary',
          error !== undefined && 'border-error focus:ring-error',
          className,
        )}
        required={required}
        aria-invalid={error !== undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        {...props}
      />
      {hint !== undefined ? <p id={hintId} className="text-xs text-secondary">{hint}</p> : null}
      {error !== undefined ? <p id={errorId} className="text-xs text-error">{error}</p> : null}
    </div>
  );
});
