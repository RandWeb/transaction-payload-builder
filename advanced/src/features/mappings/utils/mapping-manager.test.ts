/**
 * هدف فایل: تست منطق مدیریت Mapping شامل Diff، نسخه پیشنهادی و اعتبارسنجی.
 * جایگاه معماری: تست واحد features/mappings/utils.
 */
import { describe, expect, it } from 'vitest';

import { defaultMapping, type Mapping } from '@/features/mappings';
import { diffMappings, filterMappingRows, suggestNextVersion, updateMappingEntry, validateMappingAgainstTransaction, createMappingRows } from './mapping-manager';

const transaction = {
  mainTransaction: {
    fraudMessageId: 'FR-1',
    sysName: 'CORE',
    businessId: 'PASSARGAD',
    attrsList: [{ TrxAmount: '1000', ExtraField: 'x', AccountId: '1', TransactionAmount: '1000', TransactionDate: '2026-08-04' }],
  },
};

describe('mappingManager', () => {
  it('باید ۵۰ ردیف Mapping پیش‌فرض بسازد', () => {
    expect(createMappingRows(defaultMapping).length).toBe(50);
  });

  it('باید جستجو و فیلتر ردیف‌ها را اعمال کند', () => {
    const rows = createMappingRows(defaultMapping);

    expect(filterMappingRows(rows, 'Amount', 'all', 'code')).toHaveLength(1);
    expect(filterMappingRows(rows, '', 'required', 'code').length).toBeGreaterThan(0);
  });

  it('باید ویرایش کد مقصد را بدون metadata اضافه اعمال کند', () => {
    const mapping: Mapping = { ...defaultMapping };
    const updated = updateMappingEntry(mapping, '951', '951', 'TrxNewSource');

    expect(updated['951']).toBe('TrxNewSource');
    expect(Object.keys(updated)).toHaveLength(50);
  });

  it('باید Diff و نسخه پیشنهادی را بسازد', () => {
    const nextMapping: Mapping = { ...defaultMapping, '951': 'TrxChanged' };
    const diff = diffMappings(defaultMapping, nextMapping);

    expect(diff.changed).toContain('951');
    expect(suggestNextVersion('1.0.0', diff)).toBe('1.1.0');
  });

  it('باید Attribute بدون Mapping را هشدار بدهد', () => {
    const issues = validateMappingAgainstTransaction(defaultMapping, transaction);

    expect(issues.some((issue) => issue.sourceField === 'ExtraField')).toBe(true);
  });
});
