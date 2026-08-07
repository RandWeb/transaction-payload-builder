/**
 * هدف فایل: ابزارهای امن پردازش JSON برای import، export و نمایش خطای قابل فهم.
 * جایگاه معماری: shared/lib بدون وابستگی به Featureها و قابل استفاده در همه جریان‌های JSON.
 */
import { AppError } from '@/shared/api/api-error';
import type { Result } from '@/shared/types/result.types';

export interface JsonErrorPosition {
  readonly line: number;
  readonly column: number;
}

const positionPattern = /position\s+(?<position>\d+)/i;

/**
 * موقعیت خط و ستون خطای SyntaxError را از پیام مرورگر استخراج می‌کند.
 *
 * @param text - متن JSON واردشده.
 * @param error - خطای تولیدشده توسط `JSON.parse`.
 * @returns موقعیت خط/ستون یا null اگر مرورگر offset را گزارش نکرده باشد.
 */
export function getJsonErrorPosition(text: string, error: SyntaxError): JsonErrorPosition | null {
  const match = positionPattern.exec(error.message);
  const rawPosition = match?.groups?.position;
  if (rawPosition === undefined) return null;

  const position = Number(rawPosition);
  if (!Number.isInteger(position) || position < 0) return null;

  const beforeError = text.slice(0, position);
  const lines = beforeError.split('\n');
  const currentLine = lines.at(-1) ?? '';

  return {
    line: lines.length,
    column: currentLine.length + 1,
  };
}

/**
 * متن JSON را بدون throw کردن parse می‌کند و خطای فارسی همراه موقعیت تولید می‌کند.
 *
 * @param text - متن خام JSON.
 * @returns مقدار parseشده یا AppError اعتبارسنجی.
 */
export function safeJsonParse(text: string): Result<unknown> {
  try {
    return { ok: true, data: JSON.parse(text) as unknown };
  } catch (cause) {
    if (cause instanceof SyntaxError) {
      const position = getJsonErrorPosition(text, cause) ?? { line: 1, column: 1 };
      const suffix = ` در خط ${position.line}، ستون ${position.column}`;
      return { ok: false, error: AppError.validation(`JSON واردشده معتبر نیست${suffix}.`, position) };
    }

    return { ok: false, error: AppError.validation('خواندن JSON ناموفق بود.', { cause }) };
  }
}

/**
 * مقدار ورودی را به JSON خوانا تبدیل می‌کند.
 *
 * @param value - مقدار قابل سریال‌سازی.
 * @param indent - تعداد فاصله تورفتگی.
 * @returns رشته JSON خوانا.
 */
export function prettyJson(value: unknown, indent = 2): string {
  return JSON.stringify(value, null, indent);
}

/**
 * مقدار ورودی را به JSON فشرده تبدیل می‌کند.
 *
 * @param value - مقدار قابل سریال‌سازی.
 * @returns رشته JSON فشرده.
 */
export function minifyJson(value: unknown): string {
  return JSON.stringify(value);
}

/**
 * یک فایل JSON را در مرورگر برای دانلود آماده و فعال می‌کند.
 *
 * @param value - مقدار قابل export.
 * @param filename - نام فایل خروجی.
 */
export function downloadJson(value: unknown, filename: string): void {
  const blob = new Blob([typeof value === 'string' ? value : prettyJson(value)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
