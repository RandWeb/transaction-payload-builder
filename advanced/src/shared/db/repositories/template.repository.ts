/**
 * هدف فایل: Repository قالب‌های تراکنش روی SQLite.
 * جایگاه معماری: shared/db/repositories و مرز ذخیره‌سازی Template.
 */
import { AppError } from '@/shared/api/api-error';
import type { SqliteClient } from '@/shared/db/sqlite-client';
import { templateSchema, type Template } from '@/shared/db/template-record';
import { parseStoredJson, readNumber, readString } from '@/shared/db/repositories/repository-utils';
import type { Result } from '@/shared/types/result.types';

export interface TemplateRepository {
  readonly list: () => Promise<Result<readonly Template[]>>;
  readonly getById: (id: string) => Promise<Result<Template | null>>;
  readonly create: (template: Template) => Promise<Result<void>>;
  readonly update: (template: Template) => Promise<Result<void>>;
  readonly delete: (id: string) => Promise<Result<void>>;
  readonly existsByName: (name: string) => Promise<Result<boolean>>;
}

/**
 * Repository Template را با اعتبارسنجی Zod روی داده ذخیره‌شده می‌سازد.
 *
 * @param client - کلاینت SQLite.
 * @returns متدهای CRUD قالب‌ها.
 */
export function createTemplateRepository(client: SqliteClient): TemplateRepository {
  const rowToTemplate = (row: Record<string, unknown>): Result<Template> => {
    const content = readString(row, 'content_json');
    if (!content.ok) return content;
    return parseStoredJson(content.data, templateSchema);
  };

  const saveTemplate = async (template: Template, mode: 'create' | 'update'): Promise<Result<void>> => {
    const parsedTemplate = templateSchema.safeParse(template);
    if (!parsedTemplate.success) return { ok: false, error: AppError.validation('قالب برای ذخیره معتبر نیست.', parsedTemplate.error.issues) };

    const sql =
      mode === 'create'
        ? 'INSERT INTO templates (id, name, description, content_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
        : 'UPDATE templates SET name = ?, description = ?, content_json = ?, updated_at = ? WHERE id = ?';
    const params =
      mode === 'create'
        ? [template.id, template.name, template.description ?? null, JSON.stringify(template), template.createdAt, template.updatedAt]
        : [template.name, template.description ?? null, JSON.stringify(template), template.updatedAt, template.id];

    const result = client.execute(sql, params);
    if (!result.ok) return result;
    return client.persist();
  };

  return {
    list: async () => {
      await Promise.resolve();
      const rows = client.query('SELECT content_json FROM templates ORDER BY updated_at DESC');
      if (!rows.ok) return rows;
      const templates: Template[] = [];
      for (const row of rows.data) {
        const template = rowToTemplate(row);
        if (!template.ok) return template;
        templates.push(template.data);
      }
      return { ok: true, data: templates };
    },
    getById: async (id) => {
      await Promise.resolve();
      const rows = client.query('SELECT content_json FROM templates WHERE id = ? LIMIT 1', [id]);
      if (!rows.ok) return rows;
      const row = rows.data[0];
      if (row === undefined) return { ok: true, data: null };
      return rowToTemplate(row);
    },
    create: (template) => saveTemplate(template, 'create'),
    update: (template) => saveTemplate(template, 'update'),
    delete: async (id) => {
      const result = client.execute('DELETE FROM templates WHERE id = ?', [id]);
      if (!result.ok) return result;
      return client.persist();
    },
    existsByName: async (name) => {
      await Promise.resolve();
      const rows = client.query('SELECT COUNT(*) AS count FROM templates WHERE name = ?', [name]);
      if (!rows.ok) return rows;
      const count = readNumber(rows.data[0] ?? {}, 'count');
      if (!count.ok) return count;
      return { ok: true, data: count.data > 0 };
    },
  };
}
