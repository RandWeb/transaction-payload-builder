/**
 * هدف فایل: استخراج خلاصه قابل نمایش از Snapshot قالب تراکنش.
 * جایگاه معماری: features/templates/utils و منطق Pure قابل استفاده در لیست و دیالوگ‌ها.
 */
import type { Template } from '@/features/templates';

export interface TemplateSummary {
  readonly fieldCount: number;
  readonly amount: string;
  readonly transactionType: string;
}

/**
 * تعداد فیلد، مبلغ و نوع تراکنش را از Snapshot قالب استخراج می‌کند.
 *
 * @param template - قالب مورد نظر.
 * @returns خلاصه قابل نمایش قالب.
 */
export function summarizeTemplate(template: Template): TemplateSummary {
  const firstLeg = template.transaction.mainTransaction.attrsList[0] ?? {};
  return {
    fieldCount: template.transaction.mainTransaction.attrsList.reduce((count, leg) => count + Object.keys(leg).length, 0),
    amount: typeof firstLeg.TransactionAmount === 'string' || typeof firstLeg.TransactionAmount === 'number' ? String(firstLeg.TransactionAmount) : '—',
    transactionType: typeof firstLeg.TrxType === 'string' ? firstLeg.TrxType : '—',
  };
}
