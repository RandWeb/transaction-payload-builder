/**
 * هدف فایل: تعریف Result مشترک برای عملیات خطاپذیر بدون پرتاب خطا.
 * جایگاه معماری: shared/types و قابل استفاده در تمام لایه‌های دامنه.
 */
import type { AppError } from '@/shared/api/api-error';

export type Result<T, E = AppError> = { readonly ok: true; readonly data: T } | { readonly ok: false; readonly error: E };
