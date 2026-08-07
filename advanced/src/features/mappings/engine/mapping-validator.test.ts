/**
 * هدف فایل: تست Validator موتور Mapping برای ساختار Mapping و تطبیق تراکنش.
 * جایگاه معماری: تست واحد features/mappings/engine.
 */
import { describe, expect, it } from 'vitest';

import { defaultMapping } from '@/features/mappings';
import { sampleTransaction } from '@/features/transactions';
import { validateMapping, validateTransactionAgainstMapping } from './mapping-validator';

describe('mappingValidator', () => {
  it('باید Mapping پیش‌فرض را از نظر ساختاری معتبر بداند', () => {
    expect(validateMapping(defaultMapping)).toHaveLength(0);
  });

  it('باید مشکلات تطبیق تراکنش با Mapping را تولید کند', () => {
    const issues = validateTransactionAgainstMapping(sampleTransaction, defaultMapping);

    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some((issue) => issue.message.includes('ارسال نخواهد شد'))).toBe(true);
  });
});
