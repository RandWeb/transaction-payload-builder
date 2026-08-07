/**
 * هدف فایل: تولید شناسه یکتای درخواست برای HTTP و Audit.
 * جایگاه معماری: shared/api و ابزار مشترک ارتباط با سرویس مقصد.
 */

/**
 * یک UUID برای هدر `X-Request-Id` تولید می‌کند.
 *
 * @returns شناسه یکتای درخواست.
 */
export function createRequestId(): string {
  return crypto.randomUUID();
}
