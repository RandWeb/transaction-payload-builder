/**
 * هدف فایل: اعتبارسنجی Pure برای Mapping و تطبیق تراکنش با Mapping.
 * جایگاه معماری: features/mappings/engine و منبع واحد مشکلات Mapping.
 */
import type { Transaction } from '@/features/transactions';
import { mappingSchema } from '../schemas/mapping.schema';
import type { Mapping, MappingRequiredCodes } from '../types/mapping.types';
import { validateMappingAgainstTransaction } from '../utils/mapping-manager';
import type { BuildValidationIssue } from '../types/build-report.types';
import { createMappingFields } from './field-metadata';

/**
 * ساختار Mapping خام را اعتبارسنجی می‌کند.
 *
 * @param mapping - Mapping خام `code -> sourceField`.
 * @returns خطاهای ساختاری Mapping.
 */
export function validateMapping(mapping: Mapping): readonly BuildValidationIssue[] {
  const issues: BuildValidationIssue[] = [];
  const parsedMapping = mappingSchema.safeParse(mapping);
  if (!parsedMapping.success) {
    for (const issue of parsedMapping.error.issues) {
      issues.push({ path: issue.path, message: issue.message, code: String(issue.path[0] ?? '') });
    }
  }

  const fields = createMappingFields(mapping);
  const seenCodes = new Set<string>();
  const seenSourceFields = new Set<string>();
  for (const field of fields) {
    if (seenCodes.has(field.code)) issues.push({ path: [field.code], code: field.code, message: `کد مقصد ${field.code} تکراری است.` });
    if (seenSourceFields.has(field.sourceField)) {
      issues.push({ path: [field.code], code: field.code, sourceField: field.sourceField, message: `sourceField ${field.sourceField} تکراری است.` });
    }
    seenCodes.add(field.code);
    seenSourceFields.add(field.sourceField);
  }

  return issues;
}

/**
 * تراکنش فعلی را نسبت به Mapping بررسی و مشکلات قابل نمایش را تولید می‌کند.
 *
 * @param transaction - تراکنش ورودی.
 * @param mapping - Mapping خام.
 * @returns خطاها و هشدارهای تطبیقی.
 */
export function validateTransactionAgainstMapping(transaction: Transaction, mapping: Mapping, requiredCodes: MappingRequiredCodes = {}): readonly BuildValidationIssue[] {
  return validateMappingAgainstTransaction(mapping, transaction, requiredCodes).map((issue) => ({
    path: issue.code === undefined ? [issue.sourceField ?? 'mapping'] : [issue.code],
    message: issue.message,
    code: issue.code,
    sourceField: issue.sourceField,
  }));
}
