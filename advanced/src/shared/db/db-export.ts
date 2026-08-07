/**
 * هدف فایل: Export و Import فایل SQLite برای پشتیبان‌گیری و انتقال.
 * جایگاه معماری: shared/db و قابل استفاده در صفحه Settings.
 */
import type { SqliteClient } from '@/shared/db/sqlite-client';
import type { Result } from '@/shared/types/result.types';

/**
 * فایل SQLite فعلی را به Blob قابل دانلود تبدیل می‌کند.
 *
 * @param client - کلاینت SQLite.
 * @returns Blob دیتابیس با mime باینری.
 */
export function exportDatabaseBlob(client: SqliteClient): Blob {
  return new Blob([client.exportBytes()], { type: 'application/octet-stream' });
}

/**
 * فایل SQLite جدید را جایگزین دیتابیس فعلی می‌کند.
 *
 * @param client - کلاینت SQLite.
 * @param bytes - محتوای فایل SQLite واردشده.
 * @returns Result عملیات جایگزینی.
 */
export async function importDatabaseBytes(client: SqliteClient, bytes: Uint8Array): Promise<Result<void>> {
  return client.replaceWith(bytes);
}
