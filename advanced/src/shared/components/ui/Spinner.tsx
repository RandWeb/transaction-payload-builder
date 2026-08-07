/**
 * هدف فایل: نمایش وضعیت بارگذاری با متن پنهان برای Screen Reader.
 * جایگاه معماری: shared/ui برای دکمه‌ها و صفحات Loading.
 */
import { cn } from '@/shared/lib/cn';

export interface SpinnerProps {
  readonly label?: string;
  readonly className?: string;
}

/**
 * Spinner دسترس‌پذیر با role status.
 *
 * @param props - متن وضعیت و کلاس اختیاری.
 * @returns عنصر loading قابل اعلام به فناوری کمکی.
 * @example
 * <Spinner label="در حال بارگذاری" />
 */
export function Spinner({ label = 'در حال بارگذاری', className }: SpinnerProps): JSX.Element {
  return (
    <span role="status" className={cn('inline-flex items-center gap-2', className)}>
      <span aria-hidden="true" className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
