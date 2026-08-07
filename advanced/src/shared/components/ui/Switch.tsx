/**
 * هدف فایل: سوییچ کنترل‌شونده برای مقادیر روشن/خاموش.
 * جایگاه معماری: shared/ui برای تنظیمات تم، API و گزینه‌های فرم.
 */
import type { ButtonHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'role' | 'aria-checked'> {
  readonly checked: boolean;
  readonly label: string;
}

/**
 * سوییچ دسترس‌پذیر مبتنی بر button با پشتیبانی Space و Enter.
 *
 * @param props - وضعیت checked، label و اکشن‌های button.
 * @returns سوییچ قابل استفاده با کیبورد.
 * @example
 * <Switch checked={enabled} label="فعال" onClick={toggle} />
 */
export function Switch({ checked, label, className, ...props }: SwitchProps): JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={cn('inline-flex items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary', className)}
      {...props}
    >
      <span className={cn('relative inline-flex h-6 w-11 rounded-full transition', checked ? 'bg-primary' : 'bg-muted')}>
        <span className={cn('absolute top-1 size-4 rounded-full bg-surface transition', checked ? 'start-6' : 'start-1')} />
      </span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
