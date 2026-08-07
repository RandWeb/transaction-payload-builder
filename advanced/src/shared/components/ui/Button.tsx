/**
 * هدف فایل: دکمه پایه با variant، اندازه و وضعیت loading.
 * جایگاه معماری: کامپوننت shared/ui برای استفاده در تمام Feature ها.
 */
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly isLoading?: boolean;
  readonly leftIcon?: ReactNode;
  readonly rightIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:opacity-90',
  secondary: 'bg-secondary text-white hover:opacity-90',
  danger: 'bg-error text-white hover:opacity-90',
  ghost: 'bg-transparent text-text hover:bg-muted',
  outline: 'border border-border bg-surface text-text hover:bg-muted',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
};

/**
 * دکمه استاندارد برنامه با پشتیبانی از icon و loading.
 *
 * @param props - ویژگی‌های دکمه و گزینه‌های variant/size/loading.
 * @returns دکمه قابل استفاده با کیبورد و aria-busy.
 * @example
 * <Button variant="primary" isLoading>ارسال</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-60',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled === true || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : leftIcon}
      <span>{children}</span>
      {!isLoading ? rightIcon : null}
    </button>
  );
});
