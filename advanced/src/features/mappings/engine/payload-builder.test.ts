/**
 * هدف فایل: تست ساخت Payload کددارد، deterministic بودن و immutability موتور.
 * جایگاه معماری: تست واحد features/mappings/engine.
 */
import { describe, expect, it } from 'vitest';

import { defaultMapping, type Mapping } from '@/features/mappings';
import { sampleTransaction } from '@/features/transactions';
import type { Transaction } from '@/features/transactions';
import { buildPayload } from './payload-builder';

describe('payloadBuilder', () => {
  it('باید sample transaction و default mapping را به Payload کددارد ۵۰ کلیدی تبدیل کند', () => {
    const result = buildPayload(sampleTransaction, defaultMapping, { builtAt: '2026-08-04T00:00:00.000Z', mappingVersion: '1.0.0' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.payload.businessId).toBe(sampleTransaction.mainTransaction.businessId);
      expect(Object.keys(result.data.payload.attrsList[0] ?? {})).toEqual(Object.keys(defaultMapping).sort((first, second) => Number(first) - Number(second)));
      expect(result.data.payload.attrsList[0]?.['996']).toBe('');
      expect(result.data.report.mappedFields.some((field) => field.source === 'default')).toBe(true);
      expect(result.data.mappingVersion).toBe('1.0.0');
    }
  });

  it('باید خروجی deterministic بسازد', () => {
    const options = { builtAt: '2026-08-04T00:00:00.000Z', mappingVersion: '1.0.0' };
    const first = buildPayload(sampleTransaction, defaultMapping, options);
    const second = buildPayload(sampleTransaction, defaultMapping, options);

    expect(first).toEqual(second);
  });

  it('باید ورودی‌ها را mutate نکند', () => {
    const transactionClone = structuredClone(sampleTransaction);
    const mappingClone = structuredClone(defaultMapping);

    buildPayload(transactionClone, mappingClone, { builtAt: '2026-08-04T00:00:00.000Z' });

    expect(transactionClone).toEqual(sampleTransaction);
    expect(mappingClone).toEqual(defaultMapping);
  });

  it('باید Attribute بدون Mapping را در گزارش unmappedAttributes بیاورد', () => {
    const mapping: Mapping = { ...defaultMapping, '996': 'TransactionAmount' };
    const result = buildPayload(sampleTransaction, mapping, { builtAt: '2026-08-04T00:00:00.000Z' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.payload.attrsList[0]?.['996']).toBe('124000000');
      expect(result.data.report.unmappedFields.some((field) => field.fieldName === 'AccountId' && field.attrsListIndex === 0)).toBe(true);
    }
  });

  it('باید طبق Q5 برای فیلد بدون مقدار مقدار پیش‌فرض خالی بسازد', () => {
    const transaction: Transaction = {
      mainTransaction: {
        fraudMessageId: 'FR-1',
        sysName: 'CORE',
        businessId: 'PASSARGAD',
        attrsList: [{ AccountId: '1', TransactionAmount: '1', TransactionDate: '2026-08-04' }],
      },
    };
    const mapping = { ...defaultMapping, '1000': 'MissingRequired' };
    const result = buildPayload(transaction, mapping, { builtAt: '2026-08-04T00:00:00.000Z' });

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.payload.attrsList[0]?.['1000']).toBe('');
  });

  it('باید Mapping نامعتبر را با Result.error برگرداند', () => {
    const mapping = { ...defaultMapping };
    delete mapping['951'];

    expect(buildPayload(sampleTransaction, mapping).ok).toBe(false);
  });
});
