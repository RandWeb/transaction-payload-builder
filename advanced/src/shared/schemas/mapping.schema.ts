/**
 * هدف فایل: تعریف قرارداد خام Mapping فقط برای کلیدهای داخل `attrsList` نمونه `docs/curl.txt`.
 * جایگاه معماری: shared/schemas و منبع مشترک اعتبارسنجی نگاشت برای Feature و Persistence.
 */
import { z } from 'zod';

import { appConfig } from '@/config/app-config';

const attrsListTargetCodeSet = new Set<string>(appConfig.attrsListTargetCodes);

export const mappingCodeSchema = z.string().regex(/^\d+$/, 'کد مقصد باید عددی باشد.').refine((code) => attrsListTargetCodeSet.has(code), 'کد مقصد باید یکی از کدهای واقعی attrsList در docs/curl.txt باشد.');

export const mappingSourceFieldSchema = z.string().min(1, 'نام فیلد منبع الزامی است.');

export const mappingSchema = z.record(mappingCodeSchema, mappingSourceFieldSchema).superRefine((mapping, ctx) => {
  const codes = Object.keys(mapping);
  const sourceFields = new Set<string>();

  if (codes.length !== appConfig.attrsListTargetCodes.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Mapping باید دقیقاً ۴۸ کلید attrsList مطابق docs/curl.txt داشته باشد.' });
  }

  for (const requiredCode of appConfig.attrsListTargetCodes) {
    if (!(requiredCode in mapping)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [requiredCode], message: 'کد attrsList در Mapping وجود ندارد.' });
    }
  }

  for (const [code, sourceField] of Object.entries(mapping)) {
    if (!attrsListTargetCodeSet.has(code)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [code], message: 'این کد داخل attrsList نمونه curl.txt وجود ندارد.' });
    }
    if (sourceFields.has(sourceField)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [code], message: 'نام فیلد منبع تکراری است.' });
    }
    sourceFields.add(sourceField);
  }
});

export const mappingRequiredCodesSchema = z.record(mappingCodeSchema, z.boolean());
