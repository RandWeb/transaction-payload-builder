/**
 * هدف فایل: نمایش Placeholder بارگذاری برای جدول‌ها و کارت‌ها.
 * جایگاه معماری: shared/ui برای وضعیت Loading بدون پرش شدید Layout.
 */
import type { HTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

/**
 * اسکلتون ساده و قابل ترکیب برای زمان بارگذاری.
 *
 * @param props - ویژگی‌های div و className برای اندازه.
 * @returns بلوک Skeleton با انیمیشن ملایم.
 * @example
 * <Skeleton className="h-6 w-40" />
 */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={cn('animate-pulse rounded-xl bg-muted', className)} {...props} />;
}
