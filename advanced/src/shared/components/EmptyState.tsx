/**
 * هدف فایل: نمایش حالت خالی با آیکون، توضیح و اقدام پیشنهادی.
 * جایگاه معماری: shared/components برای لیست‌ها و صفحات بدون داده.
 */
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  readonly icon?: ReactNode;
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
}

/**
 * حالت خالی استاندارد برای تجربه کاربری یکسان.
 *
 * @param props - آیکون، عنوان، توضیح و اقدام اختیاری.
 * @returns کارت Empty State.
 * @example
 * <EmptyState title="داده‌ای وجود ندارد" />
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps): JSX.Element {
  return (
    <section className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
      {icon !== undefined ? <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-primary">{icon}</div> : null}
      <h2 className="text-lg font-bold text-text">{title}</h2>
      {description !== undefined ? <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-secondary">{description}</p> : null}
      {action !== undefined ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </section>
  );
}
