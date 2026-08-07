/**
 * هدف فایل: ساخت Pure و deterministic Payload مقصد از Transaction و Mapping خام.
 * جایگاه معماری: features/mappings/engine و قلب تبدیل بدون React، Store یا I/O.
 */
import { AppError } from '@/shared/api/api-error';
import type { Result } from '@/shared/types/result.types';
import { payloadSchema, type Payload, type PayloadLeg } from '@/features/payload';
import { parseTransactionJson, type Transaction, type TransactionLeg } from '@/features/transactions';
import type { Mapping, MappingRequiredCodes } from '../types/mapping.types';
import type { BuildOutput, BuildReport, BuildValidationIssue, MappingField, ResolvedValue } from '../types/build-report.types';
import { createMappingFields } from './field-metadata';
import { fieldTransformers } from './field-transformers';
import { validateMapping } from './mapping-validator';
import { OMIT, resolveValue } from './value-resolver';

export interface BuildPayloadOptions {
  readonly mappingVersion?: string;
  readonly builtAt?: string;
  readonly requiredCodes?: MappingRequiredCodes;
}

const createEmptyReport = (): BuildReport => ({
  mappedFields: [],
  omittedFields: [],
  unmappedFields: [],
  unmappedAttributes: [],
  errors: [],
  warnings: [],
});

const appendError = (errors: readonly BuildValidationIssue[], field: MappingField, message: string): readonly BuildValidationIssue[] => [
  ...errors,
  { path: [field.code], code: field.code, sourceField: field.sourceField, message },
];

const isResolvedValue = (value: ResolvedValue | typeof OMIT): value is ResolvedValue => value !== OMIT;

const collectUnmappedAttributes = (leg: TransactionLeg, fields: readonly MappingField[]): readonly { readonly name: string; readonly value: unknown }[] => {
  const mappedSourceFields = new Set(fields.map((field) => field.sourceField));
  return Object.entries(leg)
    .filter(([name]) => !mappedSourceFields.has(name))
    .map(([name, value]) => ({ name, value }));
};

const collectUnmappedFields = (
  leg: TransactionLeg,
  fields: readonly MappingField[],
  attrsListIndex: number,
): readonly { readonly fieldName: string; readonly attrsListIndex: number; readonly value: unknown; readonly message: string }[] => {
  const mappedSourceFields = new Set(fields.map((field) => field.sourceField));
  return Object.entries(leg)
    .filter(([fieldName]) => !mappedSourceFields.has(fieldName))
    .map(([fieldName, value]) => ({
      fieldName,
      attrsListIndex,
      value,
      message: `Field "${fieldName}" does not have a mapping code.`,
    }));
};

/**
 * یک ردیف attrsList را به ردیف کددارد Payload تبدیل می‌کند.
 *
 * @param leg - ردیف تراکنش.
 * @param fields - فیلدهای مشتق‌شده Mapping.
 * @param initialReport - گزارش قبلی برای تکمیل immutable.
 * @returns ردیف Payload و گزارش تکمیل‌شده.
 */
function buildPayloadLeg(leg: TransactionLeg, fields: readonly MappingField[], attrsListIndex: number, initialReport: BuildReport): { readonly leg: PayloadLeg; readonly report: BuildReport } {
  let report = initialReport;
  const payloadLeg: PayloadLeg = {};

  for (const field of fields) {
    const resolved = resolveValue(leg, field);
    if (!resolved.ok) {
      report = { ...report, errors: appendError(report.errors, field, resolved.error.messageFa) };
      continue;
    }

    if (!isResolvedValue(resolved.data)) {
      report = { ...report, omittedFields: [...report.omittedFields, { code: field.code, sourceField: field.sourceField, reason: 'فیلد اختیاری بدون مقدار است.' }] };
      continue;
    }

    const transformer = fieldTransformers[field.transform];
    const transformed = transformer(resolved.data.value);
    if (!transformed.ok) {
      report = { ...report, errors: appendError(report.errors, field, transformed.error.messageFa) };
      continue;
    }

    // کد مقصد به ترتیب صعودی پیمایش می‌شود تا خروجی برای Diff و تست پایدار بماند.
    payloadLeg[field.code] = transformed.data;
    report = {
      ...report,
      mappedFields: [
        ...report.mappedFields,
        {
          code: field.code,
          attrsListIndex,
          sourceField: field.sourceField,
          labelFa: field.labelFa,
          rawValue: resolved.data.value,
          finalValue: transformed.data,
          transform: field.transform,
          source: resolved.data.source,
        },
      ],
    };
  }

  return {
    leg: payloadLeg,
    report: {
      ...report,
      unmappedFields: [...report.unmappedFields, ...collectUnmappedFields(leg, fields, attrsListIndex)],
      unmappedAttributes: [...report.unmappedAttributes, ...collectUnmappedAttributes(leg, fields)],
    },
  };
}

/**
 * تراکنش خوانا را با Mapping خام به Payload کددارد مقصد تبدیل می‌کند.
 *
 * @param transaction - تراکنش مطابق `docs/transaction.json`.
 * @param mapping - Mapping خام مطابق `docs/mapping.json`.
 * @param options - نسخه Mapping و زمان ساخت اختیاری برای تست deterministic.
 * @returns خروجی ساخت Payload یا AppError با جزئیات کامل.
 */
export function buildPayload(transaction: Transaction, mapping: Mapping, options: BuildPayloadOptions = {}): Result<BuildOutput> {
  const parsedTransaction = parseTransactionJson(transaction);
  if (!parsedTransaction.ok) return { ok: false, error: AppError.validation('تراکنش ورودی برای ساخت Payload معتبر نیست.', parsedTransaction.error.details) };

  const mappingErrors = validateMapping(mapping);
  if (mappingErrors.length > 0) {
    return { ok: false, error: new AppError({ code: 'MAPPING', messageFa: 'Mapping ورودی برای ساخت Payload معتبر نیست.', details: mappingErrors }) };
  }

  const fields = createMappingFields(mapping, options.requiredCodes);
  let report = createEmptyReport();
  const attrsList: PayloadLeg[] = [];

  for (const [attrsListIndex, leg] of parsedTransaction.data.mainTransaction.attrsList.entries()) {
    const result = buildPayloadLeg(leg, fields, attrsListIndex, report);
    attrsList.push(result.leg);
    report = result.report;
  }

  if (report.errors.length > 0) {
    return { ok: false, error: new AppError({ code: 'MAPPING', messageFa: 'ساخت Payload به‌دلیل خطاهای Mapping ناموفق بود.', details: report }) };
  }

  const payload: Payload = {
    businessId: parsedTransaction.data.mainTransaction.businessId,
    sysName: parsedTransaction.data.mainTransaction.sysName,
    fraudMessageId: parsedTransaction.data.mainTransaction.fraudMessageId,
    attrsList,
  };

  const parsedPayload = payloadSchema.safeParse(payload);
  if (!parsedPayload.success) {
    return { ok: false, error: AppError.validation('Payload ساخته‌شده معتبر نیست.', parsedPayload.error.issues) };
  }

  return {
    ok: true,
    data: {
      payload: parsedPayload.data,
      mappingVersion: options.mappingVersion ?? 'workspace',
      builtAt: options.builtAt ?? new Date().toISOString(),
      report,
    },
  };
}
