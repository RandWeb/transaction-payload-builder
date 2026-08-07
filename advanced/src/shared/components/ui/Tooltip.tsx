/**
 * هدف فایل: Tooltip ساده قابل نمایش با hover و focus.
 * جایگاه معماری: shared/ui برای توضیح اکشن‌ها بدون وابستگی خارجی.
 */
import type { ReactNode } from 'react';

export interface TooltipProps {
  readonly content: string;
  readonly children: ReactNode;
}

/**
 * Tooltip با تأخیر CSS و پشتیبانی Focus.
 *
 * @param props - محتوای Tooltip و عنصر هدف.
 * @returns wrapper قابل focus/hover.
 * @example
 * <Tooltip content="کپی"><button>...</button></Tooltip>
 */
export function Tooltip({ content, children }: TooltipProps): JSX.Element {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full start-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-text px-2 py-1 text-xs text-bg opacity-0 transition delay-300 group-focus-within:block group-focus-within:opacity-100 group-hover:block group-hover:opacity-100"
      >
        {content}
      </span>
    </span>
  );
}
