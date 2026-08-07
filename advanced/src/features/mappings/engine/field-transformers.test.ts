/**
 * Goal: unit tests for Mapping Engine field transformers with string-only payload values.
 * Architecture: features/mappings/engine unit test.
 */
import { describe, expect, it } from 'vitest';

import { fieldTransformers, transformJalaliToIso } from './field-transformers';

describe('fieldTransformers', () => {
  it('applies trim and casing transforms', () => {
    expect(fieldTransformers.trim(' A ').ok && fieldTransformers.trim(' A ').data).toBe('A');
    expect(fieldTransformers.upper('abc').ok && fieldTransformers.upper('abc').data).toBe('ABC');
    expect(fieldTransformers.lower('ABC').ok && fieldTransformers.lower('ABC').data).toBe('abc');
  });

  it('converts Persian digits to Latin digits', () => {
    const result = fieldTransformers.digitsToLatin('۱۲۳۴');

    expect(result.ok && result.data).toBe('1234');
  });

  it('validates number and boolean values without changing their type or value', () => {
    expect(fieldTransformers.toNumber('۱,۲۳۴').ok && fieldTransformers.toNumber('۱,۲۳۴').data).toBe('۱,۲۳۴');
    expect(fieldTransformers.toBoolean('بله').ok && fieldTransformers.toBoolean('بله').data).toBe('بله');
    expect(fieldTransformers.toBoolean('0').ok && fieldTransformers.toBoolean('0').data).toBe('0');
  });

  it('converts Jalali dates to ISO strings', () => {
    const result = transformJalaliToIso('1405/05/12 14:32');

    expect(result.ok && String(result.data)).toContain('T14:32:00.000Z');
  });

  it('returns Result.error for invalid input', () => {
    expect(fieldTransformers.toNumber('abc').ok).toBe(false);
    expect(fieldTransformers.trim(['x']).ok).toBe(false);
    expect(transformJalaliToIso('bad-date').ok).toBe(false);
  });

  it('supports maskCard and none', () => {
    expect(fieldTransformers.maskCard('6037999912345678').ok && fieldTransformers.maskCard('6037999912345678').data).toBe('6037****5678');
    expect(fieldTransformers.none('value').ok && fieldTransformers.none('value').data).toBe('value');
  });
});
