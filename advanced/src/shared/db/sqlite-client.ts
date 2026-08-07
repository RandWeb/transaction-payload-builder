/**
 * هدف فایل: راه‌اندازی Lazy موتور SQLite-WASM و Persist فایل DB در IndexedDB.
 * جایگاه معماری: shared/db و تنها نقطه دسترسی سطح پایین به SQLite.
 */
import initSqlJs, { type Database, type SqlJsStatic, type SqlValue } from 'sql.js';
import sqliteWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';

import { AppError } from '@/shared/api/api-error';
import { defaultMapping } from '@/shared/data/default-mapping';
import { migrations } from '@/shared/db/migrations';
import { mappingSchema } from '@/shared/schemas/mapping.schema';
import type { Result } from '@/shared/types/result.types';

const DB_NAME = 'ftf-sqlite';
const DB_STORE = 'files';
const DB_KEY = 'main.sqlite';

type SqlParameter = SqlValue;

export interface DatabaseFileStore {
  readonly get: () => Promise<Uint8Array | null>;
  readonly set: (bytes: Uint8Array) => Promise<void>;
}

export interface SqliteClient {
  readonly db: Database;
  readonly execute: (sql: string, params?: readonly SqlParameter[]) => Result<void>;
  readonly query: (sql: string, params?: readonly SqlParameter[]) => Result<readonly Record<string, SqlValue>[]>;
  readonly persist: () => Promise<Result<void>>;
  readonly exportBytes: () => Uint8Array;
  readonly replaceWith: (bytes: Uint8Array) => Promise<Result<void>>;
}

let sqlRuntimePromise: Promise<SqlJsStatic> | null = null;
let clientPromise: Promise<Result<SqliteClient>> | null = null;

/**
 * Runtime SQLite-WASM را فقط هنگام نیاز بارگذاری می‌کند.
 *
 * @returns نمونه Runtime مربوط به sql.js.
 */
async function loadSqlRuntime(): Promise<SqlJsStatic> {
  const localWasmRelativePath = ['..', '..', '..', 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'].join('/');
  const localWasmPath = decodeURIComponent(
    new URL(localWasmRelativePath, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'),
  );
  const isNodeRuntime = import.meta.url.startsWith('file:');
  const shouldUseLocalWasmPath = isNodeRuntime || sqliteWasmUrl.startsWith('/node_modules');
  const wasmLocation = shouldUseLocalWasmPath ? localWasmPath : sqliteWasmUrl;
  sqlRuntimePromise ??= initSqlJs({ locateFile: () => wasmLocation });
  return sqlRuntimePromise;
}

/**
 * Store فایل SQLite را روی IndexedDB مرورگر می‌سازد.
 *
 * @returns API خواندن/نوشتن فایل دیتابیس.
 */
function createIndexedDbStore(): DatabaseFileStore {
  const openDatabase = (): Promise<IDBDatabase> =>
    new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(DB_STORE);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });

  return {
    get: async () => {
      const database = await openDatabase();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction(DB_STORE, 'readonly');
        const request = transaction.objectStore(DB_STORE).get(DB_KEY);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result instanceof Uint8Array ? request.result : null);
      });
    },
    set: async (bytes) => {
      const database = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(DB_STORE, 'readwrite');
        transaction.onerror = () => reject(transaction.error);
        transaction.oncomplete = () => resolve();
        transaction.objectStore(DB_STORE).put(bytes, DB_KEY);
      });
    },
  };
}

/**
 * Migrationها را idempotent اجرا می‌کند.
 *
 * @param db - دیتابیس sql.js.
 * @returns Result اجرای Migration.
 */
function runMigrations(db: Database): Result<void> {
  try {
    db.run(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
    `);

    for (const migration of migrations) {
      const applied = db.exec(`SELECT version FROM schema_migrations WHERE version = '${migration.version}' LIMIT 1`)[0]?.values[0]?.[0];
      if (applied === migration.version) continue;
      db.run(migration.sql);
      const statement = db.prepare('INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (?, ?)');
      statement.run([migration.version, new Date().toISOString()]);
      statement.free();
    }
    return { ok: true, data: undefined };
  } catch (cause) {
    return { ok: false, error: new AppError({ code: 'STORAGE', messageFa: 'اجرای Migration دیتابیس ناموفق بود.', cause }) };
  }
}

/**
 * Mapping پیش‌فرض را در اجرای اول Seed و فعال می‌کند.
 *
 * @param db - دیتابیس sql.js.
 * @returns Result عملیات Seed.
 */
function seedDefaultMapping(db: Database): Result<void> {
  const parsedMapping = mappingSchema.safeParse(defaultMapping);
  if (!parsedMapping.success) {
    return { ok: false, error: AppError.validation('Mapping پیش‌فرض معتبر نیست.', parsedMapping.error.issues) };
  }

  const count = db.exec('SELECT COUNT(*) AS count FROM mappings')[0]?.values[0]?.[0];
  if (count !== 0) return { ok: true, data: undefined };

  const statement = db.prepare('INSERT INTO mappings (version, created_at, is_active, content_json, required_json) VALUES (?, ?, ?, ?, ?)');
  statement.run([
    '1.0.0',
    new Date().toISOString(),
    1,
    JSON.stringify(parsedMapping.data),
    '{}',
  ]);
  statement.free();
  return { ok: true, data: undefined };
}

/**
 * کلاینت SQLite را از فایل ذخیره‌شده یا دیتابیس خالی می‌سازد.
 *
 * @param bytes - فایل SQLite اختیاری برای import یا تست.
 * @param persistStore - Store اختیاری برای ذخیره‌سازی.
 * @returns Result کلاینت آماده.
 */
export async function createSqliteClient(bytes?: Uint8Array, persistStore?: DatabaseFileStore): Promise<Result<SqliteClient>> {
  try {
    const SQL = await loadSqlRuntime();
    const store = persistStore ?? createIndexedDbStore();
    const storedBytes = bytes ?? (await store.get());
    let db = storedBytes === null || storedBytes === undefined ? new SQL.Database() : new SQL.Database(storedBytes);

    const migrationResult = runMigrations(db);
    if (!migrationResult.ok) return migrationResult;

    const seedResult = seedDefaultMapping(db);
    if (!seedResult.ok) return seedResult;

    const client: SqliteClient = {
      db,
      execute: (sql, params = []) => {
        try {
          const statement = db.prepare(sql);
          statement.run([...params]);
          statement.free();
          return { ok: true, data: undefined };
        } catch (cause) {
          return { ok: false, error: new AppError({ code: 'STORAGE', messageFa: 'اجرای دستور دیتابیس ناموفق بود.', cause }) };
        }
      },
      query: (sql, params = []) => {
        try {
          const statement = db.prepare(sql);
          statement.bind([...params]);
          const rows: Record<string, SqlValue>[] = [];
          while (statement.step()) rows.push(statement.getAsObject());
          statement.free();
          return { ok: true, data: rows };
        } catch (cause) {
          return { ok: false, error: new AppError({ code: 'STORAGE', messageFa: 'خواندن از دیتابیس ناموفق بود.', cause }) };
        }
      },
      persist: async () => {
        try {
          await store.set(db.export());
          return { ok: true, data: undefined };
        } catch (cause) {
          return { ok: false, error: new AppError({ code: 'STORAGE', messageFa: 'ذخیره دیتابیس در مرورگر ناموفق بود.', cause }) };
        }
      },
      exportBytes: () => db.export(),
      replaceWith: async (nextBytes) => {
        try {
          db.close();
          db = new SQL.Database(nextBytes);
          await store.set(nextBytes);
          return { ok: true, data: undefined };
        } catch (cause) {
          return { ok: false, error: new AppError({ code: 'STORAGE', messageFa: 'جایگزینی فایل دیتابیس ناموفق بود.', cause }) };
        }
      },
    };

    await client.persist();
    return { ok: true, data: client };
  } catch (cause) {
    return { ok: false, error: new AppError({ code: 'STORAGE', messageFa: 'راه‌اندازی SQLite در مرورگر ناموفق بود.', cause }) };
  }
}

/**
 * کلاینت Singleton برنامه را برمی‌گرداند.
 *
 * @returns Result کلاینت SQLite پایدار.
 */
export async function getSqliteClient(): Promise<Result<SqliteClient>> {
  clientPromise ??= createSqliteClient();
  return clientPromise;
}
