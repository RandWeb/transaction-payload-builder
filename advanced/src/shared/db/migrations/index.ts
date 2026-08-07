/**
 * هدف فایل: خروجی متمرکز Migrationهای دیتابیس SQLite.
 * جایگاه معماری: shared/db/migrations برای راه‌اندازی نسخه‌ای Schema.
 */
import initSql from './001_init.sql?raw';
import mappingMetadataSql from './002_mapping_metadata.sql?raw';

export interface DatabaseMigration {
  readonly version: string;
  readonly sql: string;
}

export const migrations: readonly DatabaseMigration[] = [
  { version: '001_init', sql: initSql },
  { version: '002_mapping_metadata', sql: mappingMetadataSql },
];
