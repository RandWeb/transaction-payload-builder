/**
 * هدف فایل: مشتق‌سازی metadata نمایشی/اجرایی فقط از Mapping خام attrsList و metadata جداگانه required.
 * جایگاه معماری: features/mappings/engine و ورودی مشترک Validator و Builder.
 */
import type { Mapping, MappingRequiredCodes } from '../types/mapping.types';
import type { MappingField, TransformName } from '../types/build-report.types';

const labelByField: Record<string, string> = {
  TrxAccountId: 'شناسه حساب',
  TrxAmount: 'مبلغ تراکنش',
  TrxBranchCode: 'کد شعبه',
  TrxChannel: 'کانال تراکنش',
  TrxCurrency: 'ارز',
  TrxDate: 'تاریخ تراکنش',
  TrxTypeCode: 'نوع تراکنش',
};

const transformByField: Record<string, TransformName> = {
  TrxDate: 'none',
};

const inferValueType = (sourceField: string): MappingField['valueType'] => {
  const normalized = sourceField.toLowerCase();
  if (normalized.includes('national') || normalized.includes('soc')) return 'array';
  return 'string';
};

/**
 * Mapping خام را به فیلدهای مشتق‌شده موتور تبدیل می‌کند.
 *
 * @param mapping - object خام `code -> sourceField` فقط برای کلیدهای attrsList.
 * @param requiredCodes - metadata جداگانه برای الزامی بودن کدها.
 * @returns فیلدهای مرتب‌شده بر اساس کد مقصد.
 */
export function createMappingFields(mapping: Mapping, requiredCodes: MappingRequiredCodes = {}): readonly MappingField[] {
  return Object.entries(mapping)
    .map(([code, sourceField]) => {
      const normalizedSourceField = sourceField.trim();
      return {
        code,
        sourceField,
        labelFa: labelByField[normalizedSourceField] ?? normalizedSourceField,
        valueType: inferValueType(normalizedSourceField),
        required: requiredCodes[code] ?? false,
        defaultValue: '',
        transform: transformByField[normalizedSourceField] ?? 'none',
      } satisfies MappingField;
    })
    .sort((first, second) => Number(first.code) - Number(second.code));
}
