/**
 * هدف فایل: نرمال‌سازی و اعتبارسنجی کمکی تراکنش ورودی کاربر بدون تغییر ساختار JSON اصلی.
 * جایگاه معماری: features/transactions/utils و منطق قابل تست ویرایشگر.
 */
import type { Mapping } from '@/features/mappings';
import { AppError } from '@/shared/api/api-error';
import { toLatinDigits } from '@/shared/lib/format';
import type { Result } from '@/shared/types/result.types';
import { transactionSchema } from '../schemas/transaction.schema';
import type { Transaction, TransactionLeg, TransactionValue } from '../types/transaction.types';

export type TransactionAttributeValueType = 'string' | 'number' | 'boolean' | 'date' | 'list';

export interface EditableAttribute {
  readonly name: string;
  readonly value: TransactionValue;
  readonly type: TransactionAttributeValueType;
}

const emptyValueByType: Record<TransactionAttributeValueType, TransactionValue> = {
  string: '',
  number: '0',
  boolean: false,
  date: new Date().toISOString(),
  list: [],
};

const jalaliDatePattern = /^(?<year>\d{4})\/(?<month>\d{2})\/(?<day>\d{2})(?:\s+(?<time>\d{2}:\d{2}(?::\d{2})?))?$/;

/**
 * نوع مقدار Attribute را برای انتخاب ورودی مناسب تشخیص می‌دهد.
 *
 * @param value - مقدار فعلی فیلد تراکنش.
 * @returns نوع قابل ویرایش مقدار.
 */
export function detectAttributeValueType(value: TransactionValue): TransactionAttributeValueType {
  if (Array.isArray(value)) return 'list';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (/^\d+(?:\.\d+)?$/.test(value)) return 'number';
  if (!Number.isNaN(new Date(value).getTime()) || jalaliDatePattern.test(value)) return 'date';
  return 'string';
}

/**
 * مقدار خام فرم را بر اساس نوع انتخاب‌شده به مقدار مجاز تراکنش تبدیل می‌کند.
 *
 * @param type - نوع مقدار انتخاب‌شده در فرم.
 * @param rawValue - مقدار خام واردشده توسط کاربر.
 * @returns مقدار نرمال‌شده قابل ذخیره در `attrsList`.
 */
export function normalizeAttributeValue(type: TransactionAttributeValueType, rawValue: string): TransactionValue {
  const latinValue = toLatinDigits(rawValue).trim();
  if (latinValue.length === 0) return emptyValueByType[type];
  if (type === 'boolean') return latinValue === 'true' || latinValue === '1';
  if (type === 'list') return latinValue.split(',').map((item) => item.trim()).filter(Boolean);
  return latinValue;
}

/**
 * تاریخ شمسی متنی را بدون کتابخانه خارجی از نظر بازه روز/ماه بررسی می‌کند.
 *
 * @param value - تاریخ با قالب `1405/05/12` و زمان اختیاری.
 * @returns درست بودن تاریخ شمسی.
 */
export function isValidJalaliDateTime(value: string): boolean {
  const latinValue = toLatinDigits(value).trim();
  const match = jalaliDatePattern.exec(latinValue);
  if (match?.groups === undefined) return false;
  const month = Number(match.groups.month);
  const day = Number(match.groups.day);
  if (month < 1 || month > 12) return false;
  const maxDay = month <= 6 ? 31 : month <= 11 ? 30 : 29;
  return day >= 1 && day <= maxDay;
}

/**
 * یک Attribute جدید را روی یک ردیف تراکنش اعمال و تکراری بودن نام را کنترل می‌کند.
 *
 * @param leg - ردیف فعلی تراکنش.
 * @param attribute - Attribute قابل ویرایش.
 * @returns ردیف بعدی یا خطای اعتبارسنجی.
 */
export function upsertAttribute(leg: TransactionLeg, attribute: EditableAttribute): Result<TransactionLeg> {
  const normalizedName = attribute.name.trim();
  if (normalizedName.length === 0) return { ok: false, error: AppError.validation('نام Attribute الزامی است.') };
  if (attribute.type === 'date' && typeof attribute.value === 'string' && attribute.value.includes('/') && !isValidJalaliDateTime(attribute.value)) {
    return { ok: false, error: AppError.validation('تاریخ شمسی واردشده معتبر نیست.') };
  }
  return { ok: true, data: { ...leg, [normalizedName]: attribute.value } };
}

/**
 * ورودی JSON کاربر را دقیقاً به ساختار `mainTransaction.attrsList` محدود می‌کند.
 *
 * @param json - مقدار ناشناخته حاصل از paste یا upload کاربر.
 * @returns تراکنش معتبر یا خطای فارسی.
 */
export function parseTransactionJson(json: unknown): Result<Transaction> {
  const result = transactionSchema.safeParse(json);
  if (!result.success) return { ok: false, error: AppError.validation('ساختار JSON باید دقیقاً مشابه docs/transaction.json باشد.', result.error.issues) };
  return { ok: true, data: result.data };
}

/**
 * فهرست نام فیلدهای Mapping فعال را از قرارداد خام `code -> sourceField` استخراج می‌کند.
 *
 * @param mapping - Mapping فعال یا null.
 * @returns نام فیلدهای قابل پیشنهاد در autocomplete.
 */
export function getMappingSourceFields(mapping: Mapping | null): readonly string[] {
  return mapping === null ? [] : Object.values(mapping);
}

/**
 * کد مقصد متناظر یک نام فیلد را در Mapping فعال پیدا می‌کند.
 *
 * @param mapping - Mapping فعال یا null.
 * @param sourceField - نام فیلد منبع.
 * @returns کد مقصد یا null.
 */
export function findTargetCode(mapping: Mapping | null, sourceField: string): string | null {
  if (mapping === null) return null;
  return Object.entries(mapping).find(([, fieldName]) => fieldName === sourceField)?.[0] ?? null;
}
