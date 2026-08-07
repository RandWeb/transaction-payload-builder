/**
 * هدف فایل: Registry توابع Pure برای تبدیل مقدار فیلدهای Payload.
 * جایگاه معماری: features/mappings/engine و قابل توسعه با اصل Open/Closed.
 */
import { AppError } from '@/shared/api/api-error';
import { maskSensitive, toLatinDigits } from '@/shared/lib/format';
import type { Result } from '@/shared/types/result.types';
import type { PayloadValue } from '@/features/payload';
import type { TransformName } from '../types/build-report.types';

export type Transformer = (value: PayloadValue) => Result<PayloadValue>;

const toStringValue = (value: PayloadValue, transform: TransformName): Result<string> => {
  if (typeof value === 'string') return { ok: true, data: value };
  return { ok: false, error: AppError.validation(`Transform ${transform} برای مقدار آرایه‌ای یا null مجاز نیست.`) };
};

const jalaliToGregorian = (jy: number, jm: number, jd: number): readonly [number, number, number] => {
  const jyAdjusted = jy - 979;
  const jmAdjusted = jm - 1;
  const jdAdjusted = jd - 1;
  let dayNumber = 365 * jyAdjusted + Math.floor(jyAdjusted / 33) * 8 + Math.floor(((jyAdjusted % 33) + 3) / 4);
  for (let index = 0; index < jmAdjusted; index += 1) dayNumber += index < 6 ? 31 : 30;
  dayNumber += jdAdjusted;
  let gregorianDayNumber = dayNumber + 79;
  const gy = 1600 + 400 * Math.floor(gregorianDayNumber / 146097);
  gregorianDayNumber %= 146097;
  let leap = true;
  let year = gy;
  if (gregorianDayNumber >= 36525) {
    gregorianDayNumber -= 1;
    year += 100 * Math.floor(gregorianDayNumber / 36524);
    gregorianDayNumber %= 36524;
    if (gregorianDayNumber >= 365) gregorianDayNumber += 1;
    else leap = false;
  }
  year += 4 * Math.floor(gregorianDayNumber / 1461);
  gregorianDayNumber %= 1461;
  if (gregorianDayNumber >= 366) {
    leap = false;
    gregorianDayNumber -= 1;
    year += Math.floor(gregorianDayNumber / 365);
    gregorianDayNumber %= 365;
  }
  const monthDays = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let month = 0;
  while (monthDays[month] !== undefined && gregorianDayNumber >= monthDays[month]) {
    gregorianDayNumber -= monthDays[month] ?? 0;
    month += 1;
  }
  return [year, month + 1, gregorianDayNumber + 1];
};

/**
 * تاریخ شمسی متنی را برای خروجی API به ISO-8601 تبدیل می‌کند.
 *
 * @param value - مقدار تاریخ با قالب `1405/05/12 14:32`.
 * @returns تاریخ ISO یا خطای فارسی.
 */
export function transformJalaliToIso(value: PayloadValue): Result<PayloadValue> {
  const stringValue = toStringValue(value, 'jalaliToIso');
  if (!stringValue.ok) return stringValue;
  const match = /^(?<year>\d{4})\/(?<month>\d{1,2})\/(?<day>\d{1,2})(?:\s+(?<time>\d{2}:\d{2}(?::\d{2})?))?$/.exec(toLatinDigits(stringValue.data).trim());
  if (match?.groups === undefined) return { ok: false, error: AppError.validation('تاریخ شمسی برای تبدیل به ISO معتبر نیست.') };
  const [gy, gm, gd] = jalaliToGregorian(Number(match.groups.year), Number(match.groups.month), Number(match.groups.day));
  const time = match.groups.time ?? '00:00:00';
  return { ok: true, data: `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}T${time.length === 5 ? `${time}:00` : time}.000Z` };
}

export const fieldTransformers: Record<TransformName, Transformer> = {
  none: (value) => ({ ok: true, data: value }),
  trim: (value) => {
    const stringValue = toStringValue(value, 'trim');
    return stringValue.ok ? { ok: true, data: stringValue.data.trim() } : stringValue;
  },
  upper: (value) => {
    const stringValue = toStringValue(value, 'upper');
    return stringValue.ok ? { ok: true, data: stringValue.data.toUpperCase() } : stringValue;
  },
  lower: (value) => {
    const stringValue = toStringValue(value, 'lower');
    return stringValue.ok ? { ok: true, data: stringValue.data.toLowerCase() } : stringValue;
  },
  digitsToLatin: (value) => {
    const stringValue = toStringValue(value, 'digitsToLatin');
    return stringValue.ok ? { ok: true, data: toLatinDigits(stringValue.data) } : stringValue;
  },
  jalaliToIso: transformJalaliToIso,
  toNumber: (value) => {
    const stringValue = toStringValue(value, 'toNumber');
    if (!stringValue.ok) return stringValue;
    const numberValue = Number(toLatinDigits(stringValue.data).replace(/,/g, ''));
    return Number.isFinite(numberValue) ? { ok: true, data: stringValue.data } : { ok: false, error: AppError.validation('تبدیل مقدار به عدد ناموفق بود.') };
  },
  toBoolean: (value) => {
    const stringValue = toStringValue(value, 'toBoolean');
    if (!stringValue.ok) return stringValue;
    const normalizedValue = toLatinDigits(stringValue.data).trim().toLowerCase();
    if (['true', '1', 'بله', 'false', '0', 'خیر'].includes(normalizedValue)) return { ok: true, data: stringValue.data };
    return { ok: false, error: AppError.validation('تبدیل مقدار به boolean ناموفق بود.') };
  },
  maskCard: (value) => {
    const stringValue = toStringValue(value, 'maskCard');
    return stringValue.ok ? { ok: true, data: maskSensitive(stringValue.data, 'card') } : stringValue;
  },
};
