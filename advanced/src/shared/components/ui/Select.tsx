/**
 * هدف فایل: select بومی استایل‌شده برای حفظ a11y و کاهش وابستگی.
 * جایگاه معماری: shared/ui برای انتخاب‌های فرم.
 */
import { forwardRef, useId } from 'react';
import type { SelectHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly label?: string;
  readonly hint?: string;
  readonly error?: string;
  readonly placeholder?: string;
  readonly options: readonly SelectOption[];
}

/**
 * انتخاب‌گر استاندارد مبتنی بر select بومی مرورگر.
 *
 * @param props - گزینه‌ها، label، placeholder و ویژگی‌های select.
 * @returns select قابل دسترس و قابل استفاده با کیبورد.
 * @example
 * <Select options={[{ value: 'mock', label: 'Mock' }]} />
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { id, label, hint, error, placeholder, options, className, ...props },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const hintId = hint === undefined ? undefined : `${selectId}-hint`;
  const errorId = error === undefined ? undefined : `${selectId}-error`;

  return (
    <div className="space-y-2">
      {label !== undefined ? <label htmlFor={selectId} className="block text-sm font-medium">{label}</label> : null}
      <select
        ref={ref}
        id={selectId}
        className={cn('min-h-11 w-full rounded-xl border border-border bg-surface px-3 py-2 text-text outline-none focus:ring-2 focus:ring-primary', className)}
        aria-invalid={error !== undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        {...props}
      >
        {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {hint !== undefined ? <p id={hintId} className="text-xs text-secondary">{hint}</p> : null}
      {error !== undefined ? <p id={errorId} className="text-xs text-error">{error}</p> : null}
    </div>
  );
});
