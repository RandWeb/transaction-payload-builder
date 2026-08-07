/**
 * هدف فایل: کارت responsive برای نمایش خلاصه و عملیات یک قالب تراکنش.
 * جایگاه معماری: features/templates/components و نمای موبایل/کارت TemplateList.
 */
import type { ReactNode } from 'react';

import type { Template } from '@/features/templates';
import { Badge, Button } from '@/shared/components/ui';
import { formatJalaliDateTime, toPersianDigits } from '@/shared/lib/format';
import type { TemplateSummary } from '../utils/template-summary';

export interface TemplateCardProps {
  readonly template: Template;
  readonly summary: TemplateSummary;
  readonly actions: ReactNode;
}

/**
 * کارت قالب را با metadata و عملیات دریافت‌شده نمایش می‌دهد.
 *
 * @param props - قالب، خلاصه و اکشن‌های کارت.
 * @returns کارت قالب.
 */
export function TemplateCard({ template, summary, actions }: TemplateCardProps): JSX.Element {
  return (
    <article className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <div className="space-y-1">
        <h3 className="font-semibold text-text">{template.name}</h3>
        <p className="text-sm text-secondary">{template.description ?? 'بدون توضیح'}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge>{toPersianDigits(summary.fieldCount)} فیلد</Badge>
        <Badge variant="info">مبلغ: {toPersianDigits(summary.amount)}</Badge>
        <Badge variant="neutral">نوع: {summary.transactionType}</Badge>
      </div>
      <p className="text-xs text-secondary">ایجاد: {formatJalaliDateTime(template.createdAt)} · بروزرسانی: {formatJalaliDateTime(template.updatedAt)}</p>
      <div className="flex flex-wrap gap-2">{actions}</div>
    </article>
  );
}

/**
 * دکمه متنی کوچک برای اکشن‌های کارت و جدول قالب‌ها.
 *
 * @param props - متن و callback دکمه.
 * @returns دکمه outline کوچک.
 */
export function TemplateActionButton({ children, onClick, variant = 'outline' }: { readonly children: ReactNode; readonly onClick: () => void; readonly variant?: 'outline' | 'danger' }): JSX.Element {
  return (
    <Button type="button" size="sm" variant={variant} onClick={onClick}>
      {children}
    </Button>
  );
}
