/**
 * هدف فایل: حل مقدار یک فیلد Mapping از Attribute، مقدار پیش‌فرض یا OMIT.
 * جایگاه معماری: features/mappings/engine و منطق Pure بدون I/O.
 */
import { AppError } from '@/shared/api/api-error';
import type { Result } from '@/shared/types/result.types';
import type { TransactionLeg } from '@/features/transactions';
import type { MappingField, OmitToken, ResolvedValue } from '../types/build-report.types';

export const OMIT: OmitToken = 'OMIT';

const isEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0 || value.every((item) => typeof item === 'string' && item.trim().length === 0);
  return false;
};

/**
 * مقدار فیلد را با ترتیب Attribute، defaultValue، خطای required و سپس OMIT حل می‌کند.
 *
 * @param attributes - ردیف Attributeهای تراکنش.
 * @param field - فیلد مشتق‌شده Mapping.
 * @returns مقدار حل‌شده یا توکن OMIT یا خطای اعتبارسنجی.
 */
export function resolveValue(attributes: TransactionLeg, field: MappingField): Result<ResolvedValue | OmitToken> {
  const attributeValue = attributes[field.sourceField];
  if (!isEmptyValue(attributeValue)) return { ok: true, data: { value: attributeValue, source: 'attribute' } };
  if (field.defaultValue !== undefined) return { ok: true, data: { value: field.defaultValue, source: 'default' } };
  if (field.required) {
    return {
      ok: false,
      error: AppError.validation(`فیلد الزامی ${field.sourceField} برای کد مقصد ${field.code} مقدار ندارد.`, { code: field.code, sourceField: field.sourceField }),
    };
  }
  return { ok: true, data: OMIT };
}
