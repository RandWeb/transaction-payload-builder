/**
 * هدف فایل: تست API قالب‌ها، seed پیش‌فرض و round-trip Import/Export.
 * جایگاه معماری: تست واحد features/templates/api با SQLite درون‌حافظه‌ای.
 */
import { describe, expect, it, vi } from 'vitest';

import { createSqliteClient, type DatabaseFileStore } from '@/shared/db/sqlite-client';
import {
  createTemplate,
  defaultTemplates,
  duplicateTemplate,
  exportTemplateToJson,
  listTemplates,
  parseTemplateJson,
  seedDefaultTemplates,
  templateNameExists,
} from './templates-api';

function createMemoryStore(): DatabaseFileStore {
  let bytes: Uint8Array | null = null;
  return {
    get: () => Promise.resolve(bytes),
    set: async (nextBytes) => {
      await Promise.resolve();
      bytes = nextBytes;
    },
  };
}

const sampleTransaction = defaultTemplates[0].transaction;

describe('templates-api', () => {
  it('باید سه قالب پیش‌فرض معتبر را در اجرای اول seed کند', async () => {
    const client = await createSqliteClient(undefined, createMemoryStore());
    if (!client.ok) throw client.error;
    vi.spyOn(await import('@/shared/db/sqlite-client'), 'getSqliteClient').mockResolvedValue(client);

    const seedResult = await seedDefaultTemplates();
    const templates = await listTemplates();

    expect(seedResult.ok).toBe(true);
    expect(templates.ok && templates.data).toHaveLength(3);
  });

  it('باید نام تکراری را مسدود و duplicate را با نام یکتا بسازد', async () => {
    const client = await createSqliteClient(undefined, createMemoryStore());
    if (!client.ok) throw client.error;
    vi.spyOn(await import('@/shared/db/sqlite-client'), 'getSqliteClient').mockResolvedValue(client);
    await seedDefaultTemplates();

    const duplicateCreate = await createTemplate({ name: defaultTemplates[0].name, transaction: sampleTransaction });
    const copied = await duplicateTemplate(defaultTemplates[0].id);
    const exists = await templateNameExists(defaultTemplates[0].name);

    expect(duplicateCreate.ok).toBe(false);
    expect(copied.ok && copied.data.name).toContain('کپی');
    expect(exists.ok && exists.data).toBe(true);
  });

  it('باید Export و Import قالب را round-trip کند', () => {
    const json = exportTemplateToJson(defaultTemplates[1]);
    const parsed = parseTemplateJson(json);

    expect(parsed.ok && parsed.data.id).toBe(defaultTemplates[1].id);
  });
});
