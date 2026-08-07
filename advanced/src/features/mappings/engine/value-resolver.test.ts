/**
 * هدف فایل: تست حل مقدار فیلد Mapping از Attribute، default، required و OMIT.
 * جایگاه معماری: تست واحد features/mappings/engine.
 */
import { describe, expect, it } from 'vitest';

import type { MappingField } from '../types/build-report.types';
import { OMIT, resolveValue } from './value-resolver';

const field: MappingField = {
  code: '951',
  sourceField: 'Source',
  labelFa: 'منبع',
  valueType: 'string',
  required: false,
  transform: 'none',
};

describe('valueResolver', () => {
  it('باید مقدار غیرخالی Attribute را برگرداند', () => {
    const result = resolveValue({ Source: ' A ' }, field);

    expect(result.ok && result.data).toEqual({ value: ' A ', source: 'attribute' });
  });

  it('باید هنگام نبود Attribute مقدار پیش‌فرض را برگرداند', () => {
    const result = resolveValue({}, { ...field, defaultValue: '' });

    expect(result.ok && result.data).toEqual({ value: '', source: 'default' });
  });

  it('باید برای فیلد required بدون مقدار خطا بدهد', () => {
    const result = resolveValue({}, { ...field, required: true });

    expect(result.ok).toBe(false);
  });

  it('باید فیلد اختیاری بدون مقدار و بدون default را OMIT کند', () => {
    const result = resolveValue({}, field);

    expect(result.ok && result.data).toBe(OMIT);
  });
});
