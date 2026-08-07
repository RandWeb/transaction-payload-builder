/**
 * هدف فایل: تایپ‌های عمومی مشترک بین Feature ها.
 * جایگاه معماری: shared/types بدون وابستگی به features.
 */
import type { AppErrorCode } from '@/shared/api/api-error';

export interface ValidationIssue {
  readonly path: string;
  readonly messageFa: string;
  readonly code: AppErrorCode;
  readonly severity: 'error' | 'warning' | 'info';
}

export interface Paginated<T> {
  readonly items: readonly T[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalItems: number;
}
