/**
 * هدف فایل: ساخت دیتابیس SQLite درون‌حافظه‌ای برای تست Repository و API.
 * جایگاه معماری: src/test/mocks و زیرساخت مشترک تست‌های ذخیره‌سازی.
 */
import { createSqliteClient, type DatabaseFileStore, type SqliteClient } from '@/shared/db/sqlite-client';

/**
 * Store درون‌حافظه‌ای بایت‌های SQLite را برای تست می‌سازد.
 *
 * @returns پیاده‌سازی DatabaseFileStore بدون IndexedDB واقعی.
 */
export function createMemoryDatabaseStore(): DatabaseFileStore {
  let bytes: Uint8Array | null = null;
  return {
    get: () => Promise.resolve(bytes),
    set: async (nextBytes) => {
      await Promise.resolve();
      bytes = nextBytes;
    },
  };
}

/**
 * کلاینت SQLite تستی را با migrationهای پروژه آماده می‌کند.
 *
 * @returns کلاینت SQLite درون‌حافظه‌ای.
 */
export async function createMemorySqliteClient(): Promise<SqliteClient> {
  const result = await createSqliteClient(undefined, createMemoryDatabaseStore());
  if (!result.ok) throw result.error;
  return result.data;
}
