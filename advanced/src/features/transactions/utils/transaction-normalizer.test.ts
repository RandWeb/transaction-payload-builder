/**
 * هدف فایل: تست ابزارهای نرمال‌سازی تراکنش و اعتبارسنجی JSON ورودی کاربر.
 * جایگاه معماری: تست واحد features/transactions/utils.
 */
import { describe, expect, it } from 'vitest';

import {
  detectAttributeValueType,
  findTargetCode,
  isValidJalaliDateTime,
  normalizeAttributeValue,
  parseTransactionJson,
  upsertAttribute,
} from './transaction-normalizer';
import sampleTransaction from '../data/sample-transaction.json';

describe('transactionNormalizer', () => {
  it('باید JSON دقیق مشابه docs/transaction.json را قبول کند', () => {
    const result = parseTransactionJson(sampleTransaction);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.mainTransaction.attrsList).toHaveLength(3);
    }
  });

  it('باید JSON با ساختار اشتباه را رد کند', () => {
    const result = parseTransactionJson({ attrsList: [] });

    expect(result.ok).toBe(false);
  });

  it('باید ارقام فارسی مبلغ را به لاتین ذخیره کند', () => {
    const value = normalizeAttributeValue('number', '۱۲۴۰۰۰۰۰۰');

    expect(value).toBe('124000000');
  });

  it('باید تاریخ شمسی نامعتبر را رد کند', () => {
    expect(isValidJalaliDateTime('1405/13/45')).toBe(false);
    expect(isValidJalaliDateTime('1405/05/12 14:32')).toBe(true);
  });

  it('باید نوع مقدار Attribute و کد مقصد Mapping را تشخیص دهد', () => {
    expect(detectAttributeValueType(['a'])).toBe('list');
    expect(findTargetCode({ '951': 'TrxSrcToolTypeCode' }, 'TrxSrcToolTypeCode')).toBe('951');
  });

  it('باید Attribute بدون نام یا تاریخ شمسی بد را رد کند', () => {
    expect(upsertAttribute({}, { name: '', type: 'string', value: '' }).ok).toBe(false);
    expect(upsertAttribute({}, { name: 'TransactionDate', type: 'date', value: '1405/13/45' }).ok).toBe(false);
  });
});
