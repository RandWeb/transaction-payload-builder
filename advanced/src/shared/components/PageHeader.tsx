/**
 * هدف فایل: هدر استاندارد صفحات با عنوان، زیرعنوان، breadcrumb و actions.
 * جایگاه معماری: shared/components برای پوسته صفحات Feature ها.
 */
import type { ReactNode } from 'react';

export interface PageHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly breadcrumb?: ReactNode;
  readonly actions?: ReactNode;
}

/**
 * هدر قابل استفاده مجدد برای صفحات اصلی برنامه.
 *
 * @param props - عنوان، زیرعنوان، breadcrumb و اکشن‌های صفحه.
 * @returns بخش header سازگار با RTL.
 * @example
 * <PageHeader title="میز کار" />
 */
export function PageHeader({ title, subtitle, breadcrumb, actions }: PageHeaderProps): JSX.Element {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        {breadcrumb !== undefined ? <div className="mb-3 text-sm text-secondary">{breadcrumb}</div> : null}
        <h1 className="text-2xl font-bold text-text">{title}</h1>
        {subtitle !== undefined ? <p className="mt-2 text-sm leading-7 text-secondary">{subtitle}</p> : null}
      </div>
      {actions !== undefined ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
