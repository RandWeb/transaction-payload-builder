import type { MappingDictionary, SourceTransaction } from '../types/transaction.types';
import type { ValidationIssue, ValidationResult } from '../types/validation.types';

type JsonObject = Record<string, unknown>;

const isJsonObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** تابع کمکی برای ایجاد Issue */
const createIssue = (
  code: ValidationIssue['code'],
  path: string,
  message: string,
): ValidationIssue => ({
  code,
  path,
  message,
});

/** اعتبارسنجی دیکشنری نگاشت */
export function validateMapping(content: string): ValidationResult<MappingDictionary> {
  const trimmed = content.trim();

  if (trimmed === '') {
    return {
      ok: false,
      issues: [createIssue('MAPPING_EMPTY', 'root', 'دیکشنری نگاشت نمی‌تواند خالی باشد.')],
    };
  }

  try {
    const parsed: unknown = JSON.parse(trimmed);

    if (!isJsonObject(parsed)) {
      return {
        ok: false,
        issues: [createIssue('MAPPING_NOT_OBJECT', 'root', 'دیکشنری نگاشت باید یک آبجکت باشد.')],
      };
    }

    const issues: ValidationIssue[] = [];
    const mapping: MappingDictionary = {};

    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value !== 'string') {
        issues.push(
          createIssue('MAPPING_VALUE_NOT_STRING', `mapping.${key}`, 'مقدار نگاشت باید رشته باشد.'),
        );
        continue;
      }

      mapping[key] = value;
    }

    if (issues.length > 0) {
      return { ok: false, issues };
    }

    return { ok: true, data: mapping };
  } catch {
    return {
      ok: false,
      issues: [createIssue('INVALID_JSON', 'root', 'فرمت نگاشت JSON نامعتبر است.')],
    };
  }
}

/** اعتبارسنجی تراکنش ورودی */
export function validateSourceTransaction(content: string): ValidationResult<SourceTransaction> {
  const trimmed = content.trim();

  if (trimmed === '') {
    return {
      ok: false,
      issues: [createIssue('EMPTY_INPUT', 'root', 'ورودی تراکنش خالی است.')],
    };
  }

  try {
    const parsed: unknown = JSON.parse(trimmed);

    if (!isJsonObject(parsed)) {
      return {
        ok: false,
        issues: [
          createIssue('MISSING_MAIN_TRANSACTION', 'root', 'ساختار تراکنش باید یک آبجکت باشد.'),
        ],
      };
    }

    const mainTransaction = parsed.mainTransaction;

    if (!isJsonObject(mainTransaction)) {
      return {
        ok: false,
        issues: [createIssue('MISSING_MAIN_TRANSACTION', 'root', 'فیلد mainTransaction یافت نشد.')],
      };
    }

    const issues: ValidationIssue[] = [];
    const requiredFields = ['fraudMessageId', 'sysName', 'businessId'] as const;

    for (const field of requiredFields) {
      if (typeof mainTransaction[field] !== 'string') {
        issues.push(
          createIssue('MISSING_FIELD', `mainTransaction.${field}`, `فیلد ${field} نامعتبر است.`),
        );
      }
    }

    const attrsList = mainTransaction.attrsList;

    if (!Array.isArray(attrsList)) {
      issues.push(
        createIssue(
          'ATTRS_LIST_NOT_ARRAY',
          'mainTransaction.attrsList',
          'فهرست ویژگی‌ها باید آرایه باشد.',
        ),
      );
    } else {
      attrsList.forEach((item: unknown, index: number) => {
        if (!isJsonObject(item)) {
          issues.push(
            createIssue(
              'ATTRS_ITEM_NOT_OBJECT',
              `mainTransaction.attrsList[${index}]`,
              'آیتم باید یک آبجکت باشد.',
            ),
          );
        }
      });
    }

    if (issues.length > 0) {
      return { ok: false, issues };
    }

    return {
      ok: true,
      data: parsed as unknown as SourceTransaction,
    };
  } catch {
    return {
      ok: false,
      issues: [createIssue('INVALID_JSON', 'root', 'فرمت تراکنش JSON نامعتبر است.')],
    };
  }
}
