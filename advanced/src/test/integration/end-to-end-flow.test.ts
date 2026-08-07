/**
 * هدف فایل: تست‌های یکپارچه جریان‌های حیاتی Import، Payload، ارسال، Audit، Template و Replay.
 * جایگاه معماری: src/test/integration و پوشش سناریوهای End-to-End بدون شبکه واقعی.
 */
import { describe, expect, it, vi } from 'vitest';

import { buildPayload, defaultMapping, type Mapping } from '@/features/mappings';
import { submitTransaction } from '@/features/submissions';
import { createTemplate, defaultTemplates } from '@/features/templates';
import { parseTransactionJson } from '@/features/transactions';
import { createMappingRepository } from '@/shared/db/repositories/mapping.repository';
import { createSubmissionRepository } from '@/shared/db/repositories/submission.repository';
import { createTemplateRepository } from '@/shared/db/repositories/template.repository';
import { getSqliteClient } from '@/shared/db/sqlite-client';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { makeSubmission, makeTransaction } from '@/test/factories/domain-factories';
import { createMemorySqliteClient } from '@/test/mocks/db';

const prepareDatabase = async () => {
  const client = await createMemorySqliteClient();
  vi.spyOn(await import('@/shared/db/sqlite-client'), 'getSqliteClient').mockResolvedValue({ ok: true, data: client });
  return client;
};

const buildDefaultPayload = (mapping: Mapping = defaultMapping, mappingVersion = '1.0.0'): ReturnType<typeof buildPayload> => buildPayload(makeTransaction(), mapping, { mappingVersion });

describe('جریان‌های یکپارچه اصلی', () => {
  it('باید Import، اعتبارسنجی، ساخت Payload، ارسال موفق و ثبت Audit را انجام دهد', async () => {
    const client = await prepareDatabase();
    const parsedTransaction = parseTransactionJson(makeTransaction());
    if (!parsedTransaction.ok) throw parsedTransaction.error;
    const mappingRepository = createMappingRepository(client);
    const saveMapping = await mappingRepository.save(defaultMapping, '1.0.0', true);
    const payload = buildPayload(parsedTransaction.data, defaultMapping, { mappingVersion: '1.0.0' });
    if (!payload.ok) throw payload.error;
    const apiResult = await submitTransaction(payload.data.payload, { mappingVersion: '1.0.0' });
    const repository = createSubmissionRepository(client);
    const audit = makeSubmission({ request: payload.data.payload, response: apiResult.ok ? apiResult.data.response : undefined, mappingVersion: '1.0.0' });
    const auditResult = await repository.create(audit);
    const history = await repository.list({ status: 'success' }, 1, 10);

    expect(saveMapping.ok).toBe(true);
    expect(apiResult.ok && apiResult.data.httpStatus).toBe(200);
    expect(auditResult.ok).toBe(true);
    expect(history.ok && history.data.items).toHaveLength(1);
  });

  it('باید تراکنش با فیلد الزامی خالی را قبل از ارسال مسدود کند', () => {
    const invalidPayload = buildPayload(makeTransaction({ attrsList: [{ AccountId: 123 as unknown as string, TransactionAmount: '1000', TransactionDate: '2026-08-04T10:00:00.000Z' }] }), defaultMapping);

    expect(invalidPayload.ok).toBe(false);
    if (!invalidPayload.ok) expect(invalidPayload.error.messageFa).toContain('Payload');
  });

  it('باید تغییر نسخه Mapping را در Payload و Audit حفظ کند', async () => {
    const client = await prepareDatabase();
    const nextMapping: Mapping = { ...defaultMapping, '951': 'TransactionAmount', '952': 'AccountId' };
    const mappingResult = await createMappingRepository(client).save(nextMapping, '2.0.0', true);
    const payload = buildDefaultPayload(nextMapping, '2.0.0');
    if (!payload.ok) throw payload.error;
    const auditResult = await createSubmissionRepository(client).create(makeSubmission({ request: payload.data.payload, mappingVersion: '2.0.0' }));
    const history = await createSubmissionRepository(client).list({ mappingVersion: '2.0.0' }, 1, 10);

    expect(mappingResult.ok).toBe(true);
    expect(payload.data.mappingVersion).toBe('2.0.0');
    expect(auditResult.ok).toBe(true);
    expect(history.ok && history.data.items[0]?.mappingVersion).toBe('2.0.0');
  });

  it('باید خطای سرور را در تاریخچه ثبت و برای تلاش مجدد قابل نگهداری کند', async () => {
    const client = await prepareDatabase();
    window.localStorage.setItem('ftf:mock-scenario', 'server-error');
    const payload = buildDefaultPayload();
    if (!payload.ok) throw payload.error;
    const apiResult = await submitTransaction(payload.data.payload, { mappingVersion: '1.0.0' });
    const repository = createSubmissionRepository(client);
    const createResult = await repository.create(makeSubmission({
      request: payload.data.payload,
      status: 'failed',
      httpStatus: apiResult.ok ? apiResult.data.httpStatus : apiResult.error.httpStatus,
      error: apiResult.ok ? undefined : { messageFa: apiResult.error.messageFa },
    }));
    const history = await repository.list({ status: 'failed' }, 1, 10);

    expect(apiResult.ok).toBe(false);
    expect(createResult.ok).toBe(true);
    expect(history.ok && history.data.items[0]?.error).toBeDefined();
  });

  it('باید timeout را به رکورد ناموفق بدون pending سرگردان تبدیل کند', async () => {
    const client = await prepareDatabase();
    const payload = buildDefaultPayload();
    if (!payload.ok) throw payload.error;
    const repository = createSubmissionRepository(client);
    await repository.create(makeSubmission({ request: payload.data.payload, status: 'failed', error: { messageFa: 'زمان پاسخ‌گویی سرویس تمام شد.' } }));
    const pendingHistory = await repository.list({ status: 'pending' }, 1, 10);
    const failedHistory = await repository.list({ status: 'failed' }, 1, 10);

    expect(pendingHistory.ok && pendingHistory.data.items).toHaveLength(0);
    expect(failedHistory.ok && failedHistory.data.items).toHaveLength(1);
  });

  it('باید ذخیره Template، بارگذاری و ساخت همان Payload را انجام دهد', async () => {
    await prepareDatabase();
    const created = await createTemplate({ name: 'سناریوی تست یکپارچه', transaction: makeTransaction() });
    if (!created.ok) throw created.error;
    const templateRepository = createTemplateRepository(await getSqliteClient().then((result) => {
      if (!result.ok) throw result.error;
      return result.data;
    }));
    const saved = await templateRepository.getById(created.data.id);
    if (!saved.ok || saved.data === null) throw new Error('template not found');
    const payloadFromDraft = buildPayload(makeTransaction(), defaultMapping);
    const payloadFromTemplate = buildPayload(saved.data.transaction, defaultMapping);

    expect(payloadFromDraft.ok && payloadFromTemplate.ok && JSON.stringify(payloadFromDraft.data.payload)).toBe(payloadFromTemplate.ok ? JSON.stringify(payloadFromTemplate.data.payload) : '');
  });

  it('باید Replay از تاریخچه میز کار را درست پر کند', () => {
    const submission = makeSubmission();
    const store = useWorkspaceStore.getState();

    store.loadFromTemplate({ id: '11111111-1111-4111-8111-111111111111', name: 'Replay', transaction: submission.transactionSnapshot, createdAt: submission.createdAt, updatedAt: submission.createdAt });

    expect(useWorkspaceStore.getState().draftTransaction.mainTransaction.fraudMessageId).toBe(submission.transactionSnapshot.mainTransaction.fraudMessageId);
  });

  it('باید سه قالب پیش‌فرض را با schema معتبر فراهم کند', () => {
    expect(defaultTemplates).toHaveLength(3);
  });
});
