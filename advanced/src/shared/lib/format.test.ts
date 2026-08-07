/**
 * هدف فایل: پوشش Edge Case های ابزارهای فرمت‌دهی فارسی.
 * جایگاه معماری: تست واحد برای منطق shared/lib بدون وابستگی به UI.
 */
import { describe, expect, it } from 'vitest';

import { AppError } from '@/shared/api/api-error';
import {
  formatJalaliDate,
  formatJalaliDateTime,
  formatToman,
  maskSensitive,
  toLatinDigits,
  toPersianDigits,
} from '@/shared/lib/format';

describe('format', () => {
  it('باید تاریخ معتبر را به تاریخ شمسی تبدیل کند', () => {
    expect(formatJalaliDate(new Date('2026-08-03T12:00:00Z'))).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
  });

  it('باید تاریخ و ساعت معتبر را با ساعت ۲۴ ساعته نمایش دهد', () => {
    expect(formatJalaliDateTime(new Date('2026-08-03T12:00:00Z'))).toMatch(
      /^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/,
    );
  });

  it('باید تاریخ نامعتبر را با AppError اعتبارسنجی رد کند', () => {
    expect(() => formatJalaliDate('invalid-date')).toThrow(AppError);

    try {
      formatJalaliDate('invalid-date');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe('VALIDATION');
    }
  });

  it('باید مبلغ صفر، منفی و خالی را به تومان نمایش دهد', () => {
    expect(formatToman(0)).toBe('۰ تومان');
    expect(formatToman(-1500)).toBe('‎−۱٬۵۰۰ تومان');
    expect(formatToman(null)).toBe('۰ تومان');
    expect(formatToman(undefined)).toBe('۰ تومان');
  });

  it('باید تبدیل ارقام فارسی و لاتین را رفت‌وبرگشتی انجام دهد', () => {
    const latinValue = '1405/05/12 14:32';
    const persianValue = '۱۴۰۵/۰۵/۱۲ ۱۴:۳۲';

    expect(toPersianDigits(latinValue)).toBe(persianValue);
    expect(toLatinDigits(persianValue)).toBe(latinValue);
    expect(toLatinDigits(toPersianDigits(latinValue))).toBe(latinValue);
  });

  it('باید مقدار null و undefined را در تبدیل رقم به رشته خالی تبدیل کند', () => {
    expect(toPersianDigits(null)).toBe('');
    expect(toLatinDigits(undefined)).toBe('');
  });

  it('باید داده حساس کوتاه و بلند را ماسک کند', () => {
    expect(maskSensitive('6037991122334455', 'card')).toBe('6037****4455');
    expect(maskSensitive('1234567', 'card')).toBe('*******');
    expect(maskSensitive(null, 'account')).toBe('');
  });
});
