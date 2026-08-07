/**
 * هدف فایل: Repository نسخه‌های Mapping خام و metadata جداگانه required روی SQLite.
 * جایگاه معماری: shared/db/repositories و مرز ذخیره‌سازی Mapping مطابق attrsList نمونه `docs/curl.txt`.
 */
import { AppError } from '@/shared/api/api-error';
import type { SqliteClient } from '@/shared/db/sqlite-client';
import { parseStoredJson, readNumber, readString } from '@/shared/db/repositories/repository-utils';
import { mappingRequiredCodesSchema, mappingSchema } from '@/shared/schemas/mapping.schema';
import type { Mapping, MappingRequiredCodes } from '@/shared/types/mapping.types';
import type { Result } from '@/shared/types/result.types';

export interface MappingVersionSummary {
  readonly version: string;
  readonly createdAt: string;
  readonly isActive: boolean;
}

export interface MappingVersionRecord {
  readonly mapping: Mapping;
  readonly requiredCodes: MappingRequiredCodes;
}

export interface MappingRepository {
  readonly getActive: () => Promise<Result<Mapping | null>>;
  readonly getActiveRecord: () => Promise<Result<MappingVersionRecord | null>>;
  readonly getByVersion: (version: string) => Promise<Result<Mapping | null>>;
  readonly getRecordByVersion: (version: string) => Promise<Result<MappingVersionRecord | null>>;
  readonly listVersions: () => Promise<Result<readonly MappingVersionSummary[]>>;
  readonly save: (mapping: Mapping, version: string, isActive?: boolean, requiredCodes?: MappingRequiredCodes) => Promise<Result<void>>;
  readonly setActive: (version: string) => Promise<Result<void>>;
  readonly delete: (version: string) => Promise<Result<void>>;
}

const parseMappingRecord = (row: Record<string, unknown>): Result<MappingVersionRecord> => {
  const contentJson = readString(row, 'content_json');
  if (!contentJson.ok) return contentJson;
  const requiredJson = readString(row, 'required_json');
  if (!requiredJson.ok) return requiredJson;
  const mapping = parseStoredJson(contentJson.data, mappingSchema);
  if (!mapping.ok) return mapping;
  const requiredCodes = parseStoredJson(requiredJson.data, mappingRequiredCodesSchema);
  if (!requiredCodes.ok) return requiredCodes;
  return { ok: true, data: { mapping: mapping.data, requiredCodes: requiredCodes.data } };
};

/**
 * Repository Mapping را روی کلاینت SQLite می‌سازد.
 *
 * @param client - کلاینت آماده SQLite.
 * @returns متدهای ذخیره و خواندن Mapping و metadata required.
 */
export function createMappingRepository(client: SqliteClient): MappingRepository {
  const validateVersion = (version: string): Result<void> => {
    if (/^\d+\.\d+\.\d+$/.test(version)) return { ok: true, data: undefined };
    return { ok: false, error: AppError.validation('نسخه Mapping باید Semver باشد.') };
  };

  return {
    getActive: async () => {
      const record = await createMappingRepository(client).getActiveRecord();
      if (!record.ok) return record;
      return { ok: true, data: record.data?.mapping ?? null };
    },
    getActiveRecord: async () => {
      await Promise.resolve();
      const rows = client.query('SELECT content_json, required_json FROM mappings WHERE is_active = 1 LIMIT 1');
      if (!rows.ok) return rows;
      const row = rows.data[0];
      return row === undefined ? { ok: true, data: null } : parseMappingRecord(row);
    },
    getByVersion: async (version) => {
      const record = await createMappingRepository(client).getRecordByVersion(version);
      if (!record.ok) return record;
      return { ok: true, data: record.data?.mapping ?? null };
    },
    getRecordByVersion: async (version) => {
      await Promise.resolve();
      const rows = client.query('SELECT content_json, required_json FROM mappings WHERE version = ? LIMIT 1', [version]);
      if (!rows.ok) return rows;
      const row = rows.data[0];
      return row === undefined ? { ok: true, data: null } : parseMappingRecord(row);
    },
    listVersions: async () => {
      await Promise.resolve();
      const rows = client.query('SELECT version, created_at, is_active FROM mappings ORDER BY created_at DESC');
      if (!rows.ok) return rows;
      const summaries: MappingVersionSummary[] = [];
      for (const row of rows.data) {
        const version = readString(row, 'version');
        if (!version.ok) return version;
        const createdAt = readString(row, 'created_at');
        if (!createdAt.ok) return createdAt;
        const isActive = readNumber(row, 'is_active');
        if (!isActive.ok) return isActive;
        summaries.push({ version: version.data, createdAt: createdAt.data, isActive: isActive.data === 1 });
      }
      return { ok: true, data: summaries };
    },
    save: async (mapping, version, isActive = false, requiredCodes = {}) => {
      const parsedMapping = mappingSchema.safeParse(mapping);
      if (!parsedMapping.success) return { ok: false, error: AppError.validation('Mapping برای ذخیره معتبر نیست.', parsedMapping.error.issues) };
      const parsedRequiredCodes = mappingRequiredCodesSchema.safeParse(requiredCodes);
      if (!parsedRequiredCodes.success) return { ok: false, error: AppError.validation('تنظیمات الزامی بودن Mapping معتبر نیست.', parsedRequiredCodes.error.issues) };
      const versionResult = validateVersion(version);
      if (!versionResult.ok) return versionResult;
      if (isActive) {
        const inactiveResult = client.execute('UPDATE mappings SET is_active = 0');
        if (!inactiveResult.ok) return inactiveResult;
      }
      const result = client.execute(
        'INSERT OR REPLACE INTO mappings (version, created_at, is_active, content_json, required_json) VALUES (?, ?, ?, ?, ?)',
        [version, new Date().toISOString(), isActive ? 1 : 0, JSON.stringify(parsedMapping.data), JSON.stringify(parsedRequiredCodes.data)],
      );
      if (!result.ok) return result;
      return client.persist();
    },
    setActive: async (version) => {
      const inactiveResult = client.execute('UPDATE mappings SET is_active = 0');
      if (!inactiveResult.ok) return inactiveResult;
      const activeResult = client.execute('UPDATE mappings SET is_active = 1 WHERE version = ?', [version]);
      if (!activeResult.ok) return activeResult;
      return client.persist();
    },
    delete: async (version) => {
      const usedRows = client.query('SELECT COUNT(*) AS count FROM submissions WHERE mapping_version = ?', [version]);
      if (!usedRows.ok) return usedRows;
      const count = usedRows.data[0]?.count;
      if (typeof count === 'number' && count > 0) {
        return { ok: false, error: new AppError({ code: 'STORAGE', messageFa: 'حذف نسخه Mapping استفاده‌شده در Audit مجاز نیست.' }) };
      }
      const result = client.execute('DELETE FROM mappings WHERE version = ?', [version]);
      if (!result.ok) return result;
      return client.persist();
    },
  };
}
