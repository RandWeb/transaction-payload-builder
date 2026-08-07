/**
 * هدف فایل: Badge معنایی با آیکون و متن برای جلوگیری از انتقال معنا فقط با رنگ.
 * جایگاه معماری: shared/ui برای وضعیت‌ها، هشدارها و برچسب‌ها.
 */
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface BadgeProps {
  readonly children: ReactNode;
  readonly variant?: BadgeVariant;
  readonly className?: string;
}

const badgeClasses: Record<BadgeVariant, string> = {
  success: 'bg-[rgb(var(--color-bg-success-subtle))] text-success',
  warning: 'bg-[rgb(var(--color-bg-warning-subtle))] text-warning',
  error: 'bg-[rgb(var(--color-bg-danger-subtle))] text-error',
  info: 'bg-[rgb(var(--color-bg-info-subtle))] text-primary',
  neutral: 'bg-muted text-secondary',
};

const badgeIcons: Record<BadgeVariant, JSX.Element> = {
  success: <CheckCircle2 className="size-4" aria-hidden="true" />,
  warning: <TriangleAlert className="size-4" aria-hidden="true" />,
  error: <AlertCircle className="size-4" aria-hidden="true" />,
  info: <Info className="size-4" aria-hidden="true" />,
  neutral: <Info className="size-4" aria-hidden="true" />,
};

/**
 * نشان وضعیت با آیکون و متن خوانا.
 *
 * @param props - متن، variant و className اختیاری.
 * @returns Badge قابل استفاده در جدول‌ها و Alert ها.
 * @example
 * <Badge variant="success">موفق</Badge>
 */
export function Badge({ children, variant = 'neutral', className }: BadgeProps): JSX.Element {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', badgeClasses[variant], className)}>
      {badgeIcons[variant]}
      <span>{children}</span>
    </span>
  );
}
