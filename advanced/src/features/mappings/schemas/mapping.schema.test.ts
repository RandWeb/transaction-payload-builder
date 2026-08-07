/**
 * هدف فایل: تست قرارداد Mapping خام و قواعد یکتایی/بازه کد.
 * جایگاه معماری: تست واحد Zod برای features/mappings.
 */
import { describe, expect, it } from 'vitest';

import docsMapping from '../../../../docs/mapping.json';
import defaultMapping from '../data/default-mapping.json';
import { mappingSchema } from './mapping.schema';

describe('mappingSchema', () => {
  it('باید default-mapping را دقیقاً مشابه docs/mapping.json نگه دارد', () => {
    const result = mappingSchema.safeParse(defaultMapping);

    expect(defaultMapping).toEqual(docsMapping);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Object.keys(result.data)).toHaveLength(50);
    }
  });

  it('باید کد خارج از بازه 951 تا 1000 را رد کند', () => {
    const invalidMapping = { ...defaultMapping, '950': 'InvalidField' };
    delete invalidMapping['951'];

    const result = mappingSchema.safeParse(invalidMapping);

    expect(result.success).toBe(false);
  });

  it('باید sourceField تکراری را رد کند', () => {
    const invalidMapping = { ...defaultMapping, '952': defaultMapping['951'] };

    const result = mappingSchema.safeParse(invalidMapping);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === 'نام فیلد منبع تکراری است.')).toBe(true);
    }
  });
});

