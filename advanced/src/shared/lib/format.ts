/**
 * هدف فایل: ابزارهای فرمت‌دهی فارسی برای تاریخ، عدد، پول و داده‌های حساس.
 * جایگاه معماری: منطق مشترک نمایشی در لایه shared/lib بدون وابستگی به UI.
 */
import { AppError } from '@/shared/api/api-error';

type SensitiveType = 'card' | 'account' | 'iban' | 'nationalCode' | 'text';

const persianDigitMap: Record<string, string> = {
  '0': '۰',
  '1': '۱',
  '2': '۲',
  '3': '۳',
  '4': '۴',
  '5': '۵',
  '6': '۶',
  '7': '۷',
  '8': '۸',
  '9': '۹',
};

const latinDigitMap: Record<string, string> = {
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
};

const jalaliDateFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  numberingSystem: 'latn',
});

const jalaliTimeFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  numberingSystem: 'latn',
});

/**
 * تاریخ ورودی را به Date معتبر تبدیل می‌کند.
 *
 * @param date - تاریخ به‌صورت Date، رشته یا عدد.
 * @returns Date معتبر برای فرمت‌دهی.
 * @throws AppError با کد VALIDATION اگر تاریخ نامعتبر باشد.
 */
function normalizeDate(date: Date | string | number): Date {
  const normalizedDate = date instanceof Date ? new Date(date.getTime()) : new Date(date);

  if (Number.isNaN(normalizedDate.getTime())) {
    throw AppError.validation('تاریخ واردشده معتبر نیست.', { date });
  }

  return normalizedDate;
}

/**
 * تاریخ میلادی ورودی را با تقویم شمسی و ارقام لاتین برای داده ساختاریافته نمایش می‌دهد.
 *
 * @param date - تاریخ معتبر قابل تبدیل به Date.
 * @returns رشته تاریخ شمسی با فرمت yyyy/MM/dd.
 * @throws AppError با کد VALIDATION اگر تاریخ نامعتبر باشد.
 */
export function formatJalaliDate(date: Date | string | number): string {
  return jalaliDateFormatter.format(normalizeDate(date));
}

/**
 * تاریخ و ساعت را با تقویم شمسی و ساعت ۲۴ ساعته نمایش می‌دهد.
 *
 * @param date - تاریخ معتبر قابل تبدیل به Date.
 * @returns رشته تاریخ و ساعت شمسی با فرمت yyyy/MM/dd HH:mm:ss.
 * @throws AppError با کد VALIDATION اگر تاریخ نامعتبر باشد.
 */
export function formatJalaliDateTime(date: Date | string | number): string {
  const normalizedDate = normalizeDate(date);
  return `${jalaliDateFormatter.format(normalizedDate)} ${jalaliTimeFormatter.format(normalizedDate)}`;
}

/**
 * مبلغ را با جداکننده هزارگان و واحد تومان برای UI فارسی نمایش می‌دهد.
 *
 * @param amount - مبلغ خام به تومان.
 * @returns مبلغ فرمت‌شده با ارقام فارسی و پسوند تومان.
 */
export function formatToman(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return '۰ تومان';
  }

  const formattedAmount = new Intl.NumberFormat('fa-IR').format(amount);
  return `${formattedAmount} تومان`;
}

/**
 * همه ارقام لاتین موجود در مقدار را به ارقام فارسی تبدیل می‌کند.
 *
 * @param value - مقدار قابل تبدیل به رشته.
 * @returns رشته با ارقام فارسی برای نمایش UI.
 */
export function toPersianDigits(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).replace(/\d/g, (digit) => persianDigitMap[digit] ?? digit);
}

/**
 * ارقام فارسی و عربی را برای Payload و JSON به ارقام لاتین تبدیل می‌کند.
 *
 * @param value - مقدار قابل تبدیل به رشته.
 * @returns رشته با ارقام لاتین برای داده ساختاریافته.
 */
export function toLatinDigits(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).replace(/[۰-۹٠-٩]/g, (digit) => latinDigitMap[digit] ?? digit);
}

/**
 * مقدار حساس را با حفظ ابتدا و انتهای رشته برای Audit و UI ماسک می‌کند.
 *
 * @param value - مقدار حساس خام.
 * @param type - نوع داده حساس برای خوانایی محل استفاده.
 * @returns مقدار ماسک‌شده یا رشته ستاره‌ای برای مقادیر خیلی کوتاه.
 */
export function maskSensitive(value: string | number | null | undefined, type: SensitiveType = 'text'): string {
  if (value === null || value === undefined) {
    return '';
  }

  const normalizedValue = String(value);
  const visibleEdgeLength = type === 'iban' ? 6 : 4;
  const minimumLength = visibleEdgeLength * 2;

  if (normalizedValue.length < minimumLength) {
    return '*'.repeat(normalizedValue.length);
  }

  return `${normalizedValue.slice(0, visibleEdgeLength)}****${normalizedValue.slice(-visibleEdgeLength)}`;
}
