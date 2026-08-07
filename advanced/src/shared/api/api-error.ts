/**
 * هدف فایل: تعریف خطای مرکزی برنامه برای نمایش پیام فارسی و کد قابل پیگیری.
 * جایگاه معماری: لایه shared/api و پایه مشترک مدیریت خطا در کل پروژه.
 */

export type AppErrorCode = 'VALIDATION' | 'MAPPING' | 'NETWORK' | 'SERVER' | 'STORAGE' | 'UNKNOWN';

interface AppErrorOptions {
  readonly code: AppErrorCode;
  readonly messageFa: string;
  readonly httpStatus?: number;
  readonly details?: unknown;
  readonly cause?: unknown;
  readonly traceId?: string;
}

/**
 * خطای استاندارد برنامه که متن قابل نمایش برای کاربر را از جزئیات فنی جدا می‌کند.
 *
 * @param options - تنظیمات خطا شامل کد، پیام فارسی و جزئیات اختیاری.
 * @returns نمونه خطای قابل استفاده در Result یا throw کنترل‌شده.
 * @example
 * throw new AppError({ code: 'VALIDATION', messageFa: 'تاریخ معتبر نیست.' });
 */
export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly messageFa: string;
  public readonly httpStatus?: number;
  public readonly details?: unknown;
  public readonly traceId?: string;

  public constructor(options: AppErrorOptions) {
    super(options.messageFa, { cause: options.cause });
    this.name = 'AppError';
    this.code = options.code;
    this.messageFa = options.messageFa;
    this.httpStatus = options.httpStatus;
    this.details = options.details;
    this.traceId = options.traceId;
  }

  /**
   * خطای اعتبارسنجی با پیام فارسی یکنواخت ایجاد می‌کند.
   *
   * @param messageFa - پیام فارسی قابل نمایش به کاربر.
   * @param details - جزئیات ساختاریافته برای تست یا UI.
   * @returns نمونه خطای اعتبارسنجی.
   */
  public static validation(messageFa: string, details?: unknown): AppError {
    return new AppError({ code: 'VALIDATION', messageFa, details });
  }

  /**
   * خطای شبکه یا Timeout را با پیام فارسی یکنواخت می‌سازد.
   *
   * @param messageFa - پیام قابل نمایش.
   * @param options - جزئیات، علت و شناسه رهگیری.
   * @returns خطای NETWORK.
   */
  public static network(messageFa = 'ارتباط با سرویس مقصد ناموفق بود.', options: Omit<AppErrorOptions, 'code' | 'messageFa'> = {}): AppError {
    return new AppError({ code: 'NETWORK', messageFa, ...options });
  }

  /**
   * خطای سمت سرور یا پاسخ HTTP ناموفق را می‌سازد.
   *
   * @param messageFa - پیام قابل نمایش.
   * @param options - وضعیت HTTP و جزئیات پاسخ.
   * @returns خطای SERVER.
   */
  public static server(messageFa = 'سرویس مقصد پاسخ ناموفق برگرداند.', options: Omit<AppErrorOptions, 'code' | 'messageFa'> = {}): AppError {
    return new AppError({ code: 'SERVER', messageFa, ...options });
  }

  /**
   * خطای ذخیره‌سازی را با پیام فارسی یکنواخت می‌سازد.
   *
   * @param messageFa - پیام قابل نمایش.
   * @param details - جزئیات اختیاری.
   * @returns خطای STORAGE.
   */
  public static storage(messageFa: string, details?: unknown): AppError {
    return new AppError({ code: 'STORAGE', messageFa, details });
  }

  /**
   * خطای ناشناخته را بدون افشای متن خام به AppError تبدیل می‌کند.
   *
   * @param error - خطای ناشناخته.
   * @returns AppError قابل نمایش.
   */
  public static from(error: unknown): AppError {
    if (error instanceof AppError) return error;
    return new AppError({ code: 'UNKNOWN', messageFa: 'خطای پیش‌بینی‌نشده رخ داد.', details: { type: typeof error }, cause: error });
  }
}

/**
 * پیام امن و فارسی قابل نمایش به کاربر را از هر خطایی استخراج می‌کند.
 *
 * @param error - خطای ناشناخته یا AppError.
 * @returns پیام فارسی بدون stack trace یا متن خام انگلیسی.
 */
export function toUserMessage(error: unknown): string {
  return AppError.from(error).messageFa;
}
