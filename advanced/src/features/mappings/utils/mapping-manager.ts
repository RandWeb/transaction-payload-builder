/**
 * هدف فایل: منطق قابل تست مدیریت Mapping خام، Diff، اعتبارسنجی و پیشنهاد نسخه.
 * جایگاه معماری: features/mappings/utils و بدون وابستگی به UI.
 */
import { appConfig } from '@/config/app-config';
import type { Transaction } from '@/features/transactions';
import { mappingSchema, type Mapping } from '@/features/mappings';

export type MappingFilter = 'all' | 'required' | 'transform' | 'empty';
export type MappingSortKey = 'code' | 'sourceField';
export type MappingIssueSeverity = 'error' | 'warning' | 'info';

export interface MappingRow {
  readonly code: string;
  readonly sourceField: string;
  readonly labelFa: string;
  readonly valueType: string;
  readonly required: boolean;
  readonly transform: string;
  readonly status: 'ok' | 'warning' | 'error';
}

export interface MappingIssue {
  readonly severity: MappingIssueSeverity;
  readonly code?: string;
  readonly sourceField?: string;
  readonly message: string;
}

export interface MappingDiff {
  readonly added: readonly string[];
  readonly removed: readonly string[];
  readonly changed: readonly string[];
}

const requiredFields = new Set(['TrxMessageId', 'TrxFraudMessageId', 'TrxDate', 'TrxAmount', 'TrxTypeCode']);
const transformByField: Record<string, string> = {
  TrxAmount: 'number',
  TrxDate: 'datetime',
  TrxFraudMessageId: 'string',
  TrxMessageId: 'string',
};

const labelByField: Record<string, string> = {
  TrxAccountId: 'شناسه حساب',
  TrxAmount: 'مبلغ تراکنش',
  TrxBranchCode: 'کد شعبه',
  TrxChannel: 'کانال تراکنش',
  TrxCurrency: 'ارز',
  TrxDate: 'تاریخ تراکنش',
  TrxFraudMessageId: 'شناسه پیام Fraud',
  TrxMessageId: 'شناسه پیام',
  TrxTypeCode: 'نوع تراکنش',
};

const normalizeLabelKey = (value: string): string => value.trim();

/**
 * کدهای مجاز مقصد را از بازه قفل‌شده تنظیمات تولید می‌کند.
 *
 * @returns آرایه کدهای 951 تا 1000.
 */
export function getTargetCodes(): readonly string[] {
  return Array.from(
    { length: appConfig.targetCodeRange.to - appConfig.targetCodeRange.from + 1 },
    (_, index) => String(appConfig.targetCodeRange.from + index),
  );
}

/**
 * Mapping خام را به ردیف‌های قابل نمایش در جدول تبدیل می‌کند.
 *
 * @param mapping - object خام `code -> sourceField`.
 * @returns ردیف‌های مرتب‌شده بر اساس کد مقصد.
 */
export function createMappingRows(mapping: Mapping): readonly MappingRow[] {
  return Object.entries(mapping)
    .map(([code, sourceField]) => {
      const normalizedField = normalizeLabelKey(sourceField);
      return {
        code,
        sourceField,
        labelFa: labelByField[normalizedField] ?? normalizedField,
        valueType: normalizedField.toLowerCase().includes('amount') ? 'number' : normalizedField.toLowerCase().includes('date') ? 'date' : 'string',
        required: requiredFields.has(normalizedField),
        transform: transformByField[normalizedField] ?? 'none',
        status: sourceField.trim().length === 0 ? 'error' : 'ok',
      };
    })
    .sort((first, second) => Number(first.code) - Number(second.code));
}

/**
 * ردیف‌های Mapping را با جستجو، فیلتر، مرتب‌سازی و صفحه‌بندی آماده نمایش می‌کند.
 *
 * @param rows - ردیف‌های خام جدول.
 * @param query - متن جستجو.
 * @param filter - فیلتر انتخاب‌شده.
 * @param sortKey - کلید مرتب‌سازی.
 * @returns ردیف‌های فیلتر و مرتب‌شده.
 */
export function filterMappingRows(rows: readonly MappingRow[], query: string, filter: MappingFilter, sortKey: MappingSortKey): readonly MappingRow[] {
  const normalizedQuery = query.trim().toLowerCase();
  return rows
    .filter((row) => {
      const matchesQuery = normalizedQuery.length === 0 || row.code.includes(normalizedQuery) || row.sourceField.toLowerCase().includes(normalizedQuery);
      const matchesFilter =
        filter === 'all' ||
        (filter === 'required' && row.required) ||
        (filter === 'transform' && row.transform !== 'none') ||
        (filter === 'empty' && row.sourceField.trim().length === 0);
      return matchesQuery && matchesFilter;
    })
    .sort((first, second) => (sortKey === 'code' ? Number(first.code) - Number(second.code) : first.sourceField.localeCompare(second.sourceField)));
}

/**
 * Mapping را بدون تغییر شکل فایل خام و فقط با جابه‌جایی/ویرایش مقدار sourceField به‌روزرسانی می‌کند.
 *
 * @param mapping - Mapping فعلی.
 * @param previousCode - کد قبلی ردیف.
 * @param nextCode - کد مقصد انتخاب‌شده.
 * @param sourceField - نام فیلد منبع.
 * @returns Mapping بعدی.
 */
export function updateMappingEntry(mapping: Mapping, previousCode: string, nextCode: string, sourceField: string): Mapping {
  const nextMapping = { ...mapping };
  if (previousCode !== nextCode) {
    delete nextMapping[previousCode];
  }
  nextMapping[nextCode] = sourceField;
  return nextMapping;
}

/**
 * اختلاف دو Mapping خام را برای نمایش قبل از Import محاسبه می‌کند.
 *
 * @param current - Mapping فعلی.
 * @param next - Mapping واردشده.
 * @returns کدهای افزوده، حذف‌شده و تغییرکرده.
 */
export function diffMappings(current: Mapping, next: Mapping): MappingDiff {
  const currentCodes = new Set(Object.keys(current));
  const nextCodes = new Set(Object.keys(next));
  return {
    added: [...nextCodes].filter((code) => !currentCodes.has(code)).sort(),
    removed: [...currentCodes].filter((code) => !nextCodes.has(code)).sort(),
    changed: [...nextCodes].filter((code) => currentCodes.has(code) && current[code] !== next[code]).sort(),
  };
}

/**
 * نسخه Semver بعدی را بر اساس نوع Diff پیشنهاد می‌دهد.
 *
 * @param version - نسخه فعلی.
 * @param diff - اختلاف Mapping.
 * @returns نسخه پیشنهادی.
 */
export function suggestNextVersion(version: string, diff: MappingDiff): string {
  const match = /^(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)$/.exec(version);
  const major = Number(match?.groups?.major ?? 1);
  const minor = Number(match?.groups?.minor ?? 0);
  const patch = Number(match?.groups?.patch ?? 0);
  if (diff.removed.length > 0 || diff.added.length > 0) return `${major + 1}.0.0`;
  if (diff.changed.length > 0) return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

/**
 * مشکلات Mapping را نسبت به تراکنش فعلی و قرارداد خام `docs/mapping.json` تولید می‌کند.
 *
 * @param mapping - Mapping مورد بررسی.
 * @param transaction - تراکنش فعلی Workspace.
 * @returns فهرست خطا، هشدار و اطلاع‌رسانی.
 */
export function validateMappingAgainstTransaction(mapping: Mapping, transaction: Transaction): readonly MappingIssue[] {
  const issues: MappingIssue[] = [];
  const parsedMapping = mappingSchema.safeParse(mapping);
  if (!parsedMapping.success) {
    for (const issue of parsedMapping.error.issues) {
      issues.push({ severity: 'error', code: String(issue.path[0] ?? ''), message: issue.message });
    }
  }

  const fieldsInTransaction = new Set(transaction.mainTransaction.attrsList.flatMap((leg) => Object.keys(leg)));
  const mappedFields = new Set(Object.values(mapping));

  for (const row of createMappingRows(mapping)) {
    if (row.required && !fieldsInTransaction.has(row.sourceField)) {
      issues.push({ severity: 'error', code: row.code, sourceField: row.sourceField, message: 'فیلد الزامی در تراکنش فعلی مقدار متناظر ندارد.' });
    }
    if (!fieldsInTransaction.has(row.sourceField)) {
      issues.push({ severity: 'warning', code: row.code, sourceField: row.sourceField, message: 'برای این فیلد Mapping، Attribute متناظر در تراکنش فعلی وجود ندارد.' });
    }
  }

  for (const fieldName of fieldsInTransaction) {
    if (!mappedFields.has(fieldName)) {
      issues.push({ severity: 'warning', sourceField: fieldName, message: 'این Attribute در Mapping نیست و ارسال نخواهد شد.' });
    }
  }

  for (const code of getTargetCodes()) {
    if (!(code in mapping)) {
      issues.push({ severity: 'info', code, message: 'این کد در بازه مقصد استفاده نشده است.' });
    }
  }

  return issues;
}
