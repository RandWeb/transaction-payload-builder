/**
 * هدف فایل: تست ابزارهای امن JSON برای خطای Syntax، فرمت خوانا و فشرده‌سازی.
 * جایگاه معماری: تست واحد shared/lib بدون وابستگی به Featureها.
 */
import { describe, expect, it } from 'vitest';

import { getJsonErrorPosition, minifyJson, prettyJson, safeJsonParse } from './json';

describe('json utilities', () => {
  it('باید JSON معتبر را بدون خطا parse کند', () => {
    const result = safeJsonParse('{"name":"trx"}');

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual({ name: 'trx' });
  });

  it('باید خطای Syntax را با شماره خط گزارش کند', () => {
    const result = safeJsonParse('{\n  "name":\n}');

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.messageFa).toContain('خط');
  });

  it('باید موقعیت خطا را از offset محاسبه کند', () => {
    const error = new SyntaxError('Unexpected token } in JSON at position 13');

    expect(getJsonErrorPosition('{\n  "name":\n}', error)).toEqual({ line: 3, column: 2 });
  });

  it('باید JSON خوانا و فشرده تولید کند', () => {
    const value = { ok: true };

    expect(prettyJson(value)).toContain('\n');
    expect(minifyJson(value)).toBe('{"ok":true}');
  });
});
