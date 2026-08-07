/**
 * هدف فایل: لایه نازک API قالب‌ها روی Repository SQLite با Result و Zod.
 * جایگاه معماری: features/templates/api و مرز دسترسی UI به ذخیره‌سازی قالب.
 */
import { templateSchema, type Template } from '@/features/templates';
import { AppError } from '@/shared/api/api-error';
import { createTemplateRepository } from '@/shared/db/repositories/template.repository';
import { getSqliteClient } from '@/shared/db/sqlite-client';
import { safeJsonParse } from '@/shared/lib/json';
import type { Result } from '@/shared/types/result.types';
import defaultTemplatesJson from '../data/default-templates.json';

const defaultTemplatesSchema = templateSchema.array().length(3);

export const defaultTemplates = defaultTemplatesSchema.parse(defaultTemplatesJson);

export interface TemplateInput {
  readonly name: string;
  readonly description?: string;
  readonly transaction: Template['transaction'];
}

const normalizeName = (name: string): string => name.trim();

const createTemplateId = (): string => crypto.randomUUID();

const buildTemplate = (input: TemplateInput, id = createTemplateId(), createdAt = new Date().toISOString()): Template => {
  const normalizedName = normalizeName(input.name);
  const now = new Date().toISOString();
  return {
    id,
    name: normalizedName,
    description: input.description?.trim() === '' ? undefined : input.description?.trim(),
    transaction: input.transaction,
    createdAt,
    updatedAt: now,
  };
};

const loadRepository = async () => {
  const client = await getSqliteClient();
  if (!client.ok) return client;
  return { ok: true as const, data: createTemplateRepository(client.data) };
};

/**
 * قالب‌های پیش‌فرض را فقط وقتی لیست قالب‌ها خالی است وارد دیتابیس می‌کند.
 *
 * @returns نتیجه seed دیتابیس.
 */
export async function seedDefaultTemplates(): Promise<Result<void>> {
  const repository = await loadRepository();
  if (!repository.ok) return repository;
  const existingTemplates = await repository.data.list();
  if (!existingTemplates.ok) return existingTemplates;
  if (existingTemplates.data.length > 0) return { ok: true, data: undefined };

  for (const template of defaultTemplates) {
    const result = await repository.data.create(template);
    if (!result.ok) return result;
  }
  return { ok: true, data: undefined };
}

/**
 * لیست قالب‌ها را پس از seed اولیه از دیتابیس می‌خواند.
 *
 * @returns قالب‌های ذخیره‌شده.
 */
export async function listTemplates(): Promise<Result<readonly Template[]>> {
  const seedResult = await seedDefaultTemplates();
  if (!seedResult.ok) return seedResult;
  const repository = await loadRepository();
  if (!repository.ok) return repository;
  return repository.data.list();
}

/**
 * یک قالب را با شناسه از دیتابیس می‌خواند.
 *
 * @param id - شناسه قالب.
 * @returns قالب یا null.
 */
export async function getTemplateById(id: string): Promise<Result<Template | null>> {
  const repository = await loadRepository();
  if (!repository.ok) return repository;
  return repository.data.getById(id);
}

/**
 * تکراری بودن نام قالب را بررسی می‌کند.
 *
 * @param name - نام قابل بررسی.
 * @returns true اگر نام قبلا ذخیره شده باشد.
 */
export async function templateNameExists(name: string): Promise<Result<boolean>> {
  const repository = await loadRepository();
  if (!repository.ok) return repository;
  return repository.data.existsByName(normalizeName(name));
}

/**
 * قالب جدید را پس از اعتبارسنجی نام یکتا ذخیره می‌کند.
 *
 * @param input - نام، توضیح و Snapshot تراکنش.
 * @returns قالب ذخیره‌شده.
 */
export async function createTemplate(input: TemplateInput): Promise<Result<Template>> {
  const repository = await loadRepository();
  if (!repository.ok) return repository;
  const exists = await repository.data.existsByName(normalizeName(input.name));
  if (!exists.ok) return exists;
  if (exists.data) return { ok: false, error: AppError.validation('نام قالب تکراری است.') };

  const template = buildTemplate(input);
  const createResult = await repository.data.create(template);
  if (!createResult.ok) return createResult;
  return { ok: true, data: template };
}

/**
 * نام، توضیح یا Snapshot قالب موجود را به‌روزرسانی می‌کند.
 *
 * @param template - قالب کامل به‌روزشده.
 * @returns قالب ذخیره‌شده.
 */
export async function updateTemplate(template: Template): Promise<Result<Template>> {
  const repository = await loadRepository();
  if (!repository.ok) return repository;
  const parsedTemplate = templateSchema.safeParse({ ...template, name: normalizeName(template.name), updatedAt: new Date().toISOString() });
  if (!parsedTemplate.success) return { ok: false, error: AppError.validation('قالب برای به‌روزرسانی معتبر نیست.', parsedTemplate.error.issues) };
  const templates = await repository.data.list();
  if (!templates.ok) return templates;
  const duplicate = templates.data.some((item) => item.id !== parsedTemplate.data.id && item.name === parsedTemplate.data.name);
  if (duplicate) return { ok: false, error: AppError.validation('نام قالب تکراری است.') };

  const updateResult = await repository.data.update(parsedTemplate.data);
  if (!updateResult.ok) return updateResult;
  return { ok: true, data: parsedTemplate.data };
}

/**
 * یک قالب را حذف می‌کند.
 *
 * @param id - شناسه قالب.
 * @returns نتیجه حذف.
 */
export async function removeTemplate(id: string): Promise<Result<void>> {
  const repository = await loadRepository();
  if (!repository.ok) return repository;
  return repository.data.delete(id);
}

/**
 * یک قالب موجود را با نام جدید کپی می‌کند.
 *
 * @param id - شناسه قالب مبدا.
 * @returns قالب کپی‌شده.
 */
export async function duplicateTemplate(id: string): Promise<Result<Template>> {
  const source = await getTemplateById(id);
  if (!source.ok) return source;
  if (source.data === null) return { ok: false, error: AppError.validation('قالب انتخاب‌شده پیدا نشد.') };
  const templates = await listTemplates();
  if (!templates.ok) return templates;
  const names = new Set(templates.data.map((template) => template.name));
  let nextName = `${source.data.name} - کپی`;
  let copyIndex = 2;
  while (names.has(nextName)) {
    nextName = `${source.data.name} - کپی ${copyIndex}`;
    copyIndex += 1;
  }
  return createTemplate({
    name: nextName,
    description: source.data.description,
    transaction: source.data.transaction,
  });
}

/**
 * متن JSON قالب را parse و با Zod اعتبارسنجی می‌کند.
 *
 * @param text - متن JSON واردشده توسط کاربر.
 * @returns قالب معتبر.
 */
export function parseTemplateJson(text: string): Result<Template> {
  const parsedJson = safeJsonParse(text);
  if (!parsedJson.ok) return parsedJson;
  const template = templateSchema.safeParse(parsedJson.data);
  if (!template.success) return { ok: false, error: AppError.validation('ساختار JSON قالب معتبر نیست.', template.error.issues) };
  return { ok: true, data: template.data };
}

/**
 * قالب را به متن JSON خوانا برای Export تبدیل می‌کند.
 *
 * @param template - قالب قابل خروجی گرفتن.
 * @returns متن JSON.
 */
export function exportTemplateToJson(template: Template): string {
  return JSON.stringify(template, null, 2);
}
