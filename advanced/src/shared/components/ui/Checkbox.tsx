/**
 * هدف فایل: checkbox پایه با label و توضیح اختیاری.
 * جایگاه معماری: shared/ui برای کنترل‌های boolean فرم.
 */
import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  readonly label: string;
  readonly hint?: string;
}

/**
 * چک‌باکس استاندارد با ناحیه کلیک مناسب و پشتیبانی کیبورد.
 *
 * @param props - ویژگی‌های checkbox و متن label/hint.
 * @returns ورودی checkbox دسترس‌پذیر.
 * @example
 * <Checkbox label="الزامی" />
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { id, label, hint, className, ...props },
  ref,
) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  return (
    <label htmlFor={checkboxId} className="flex cursor-pointer items-start gap-3 rounded-xl p-2">
      <input ref={ref} id={checkboxId} type="checkbox" className={cn('mt-1 size-4 accent-primary', className)} {...props} />
      <span>
        <span className="block text-sm font-medium text-text">{label}</span>
        {hint !== undefined ? <span className="block text-xs text-secondary">{hint}</span> : null}
      </span>
    </label>
  );
});
