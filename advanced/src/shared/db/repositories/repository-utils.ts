/**
 * هدف فایل: ابزارهای مشترک Repositoryها برای خواندن امن row و JSON.
 * جایگاه معماری: shared/db/repositories و جلوگیری از تکرار منطق.
 */
import type { z } from 'zod';

import { AppError } from '@/shared/api/api-error';
import type { Result } from '@/shared/types/result.types';

/**
 * مقدار رشته‌ای یک ستون را از row دیتابیس استخراج می‌کند.
 *
 * @param row - رکورد خام برگشتی از SQLite.
 * @param key - نام ستون.
 * @returns مقدار رشته‌ای ستون یا خطای STORAGE.
 */
export function readString(row: Record<string, unknown>, key: string): Result<string> {
  const value = row[key];
  if (typeof value !== 'string') {
    return { ok: false, error: new AppError({ code: 'STORAGE', messageFa: `ستون ${key} در دیتابیس معتبر نیست.` }) };
  }
  return { ok: true, data: value };
}

/**
 * مقدار عددی یک ستون را از row دیتابیس استخراج می‌کند.
 *
 * @param row - رکورد خام برگشتی از SQLite.
 * @param key - نام ستون.
 * @returns مقدار عددی ستون یا خطای STORAGE.
 */
export function readNumber(row: Record<string, unknown>, key: string): Result<number> {
  const value = row[key];
  if (typeof value !== 'number') {
    return { ok: false, error: new AppError({ code: 'STORAGE', messageFa: `ستون ${key} در دیتابیس عددی نیست.` }) };
  }
  return { ok: true, data: value };
}

/**
 * JSON ذخیره‌شده را Parse و با Schema مقصد اعتبارسنجی می‌کند.
 *
 * @param json - رشته JSON ذخیره‌شده در SQLite.
 * @param schema - Schema مقصد برای اعتبارسنجی Runtime.
 * @returns داده Parse شده یا خطای STORAGE.
 */
export function parseStoredJson<T>(json: string, schema: z.ZodType<T>): Result<T> {
  try {
    const parsedValue: unknown = JSON.parse(json);
    const result = schema.safeParse(parsedValue);
    if (!result.success) {
      return { ok: false, error: AppError.validation('داده ذخیره‌شده با قرارداد مورد انتظار سازگار نیست.', result.error.issues) };
    }
    return { ok: true, data: result.data };
  } catch (cause) {
    return { ok: false, error: new AppError({ code: 'STORAGE', messageFa: 'خواندن JSON ذخیره‌شده ناموفق بود.', cause }) };
  }
}
