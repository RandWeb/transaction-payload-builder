/**
 * هدف فایل: تست Repositoryهای SQLite با دیتابیس درون‌حافظه‌ای.
 * جایگاه معماری: تست shared/db بدون وابستگی به مرورگر واقعی.
 */
import { describe, expect, it } from 'vitest';

import type { Submission } from '@/features/submissions';
import type { Template } from '@/features/templates';
import { defaultMapping } from '@/shared/data/default-mapping';
import { createSqliteClient, type DatabaseFileStore, type SqliteClient } from '@/shared/db/sqlite-client';
import { createMappingRepository } from '@/shared/db/repositories/mapping.repository';
import { createSubmissionRepository } from '@/shared/db/repositories/submission.repository';
import { createTemplateRepository } from '@/shared/db/repositories/template.repository';

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

const sampleTransaction = {
  mainTransaction: {
    fraudMessageId: 'FR-1',
    sysName: 'CORE',
    businessId: 'PASSARGAD',
    attrsList: [{ AccountId: '1', TransactionAmount: '1000', TransactionDate: '2026-08-04 12:00:00' }],
  },
};

async function createClient(): Promise<SqliteClient> {
  const result = await createSqliteClient(undefined, createMemoryStore());
  if (!result.ok) throw result.error;
  return result.data;
}

describe('sqlite repositories', () => {
  it('باید Mapping پیش‌فرض را Seed و فعال کند', async () => {
    const client = await createClient();
    const repository = createMappingRepository(client);

    const activeMapping = await repository.getActive();
    const versions = await repository.listVersions();

    expect(activeMapping.ok && activeMapping.data).toEqual(defaultMapping);
    expect(versions.ok && versions.data[0]?.isActive).toBe(true);
    expect(versions.ok && versions.data[0]?.version).toBe('1.0.0');
  });

  it('باید نسخه Mapping را ذخیره و فعال کند', async () => {
    const client = await createClient();
    const repository = createMappingRepository(client);
    const nextMapping = structuredClone(defaultMapping);
    nextMapping['951'] = 'TrxSrcToolTypeCodeNext';

    const saveResult = await repository.save(nextMapping, '1.0.1', true);
    const activeMapping = await repository.getActive();

    expect(saveResult.ok).toBe(true);
    expect(activeMapping.ok && activeMapping.data?.['951']).toBe('TrxSrcToolTypeCodeNext');
  });

  it('باید Template را ذخیره و با نام پیدا کند', async () => {
    const client = await createClient();
    const repository = createTemplateRepository(client);
    const template: Template = {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'قالب تست',
      description: 'توضیح تست',
      transaction: sampleTransaction,
      createdAt: '2026-08-04T00:00:00.000Z',
      updatedAt: '2026-08-04T00:00:00.000Z',
    };

    const createResult = await repository.create(template);
    const existsResult = await repository.existsByName(template.name);
    const listResult = await repository.list();

    expect(createResult.ok).toBe(true);
    expect(existsResult.ok && existsResult.data).toBe(true);
    expect(listResult.ok && listResult.data).toHaveLength(1);
  });

  it('باید Submission را ذخیره و بازیابی کند', async () => {
    const client = await createClient();
    const repository = createSubmissionRepository(client);
    const submission: Submission = {
      id: '22222222-2222-4222-8222-222222222222',
      createdAt: '2026-08-04T00:00:00.000Z',
      createdAtJalali: '1405/05/13',
      requestId: '33333333-3333-4333-8333-333333333333',
      request: {
        businessId: 'PASSARGAD',
        sysName: 'CORE',
        fraudMessageId: 'FR-1',
        attrsList: [{ '951': '5' }],
      },
      durationMs: 100,
      status: 'success',
      mappingVersion: '1.0.0',
      transactionSnapshot: sampleTransaction,
      legCount: 3,
      fraudMessageId: sampleTransaction.mainTransaction.fraudMessageId,
    };

    const createResult = await repository.create(submission);
    const getResult = await repository.getById(submission.id);
    const listResult = await repository.list({ status: 'success' }, 1, 10);

    expect(createResult.ok).toBe(true);
    expect(getResult.ok && getResult.data?.requestId).toBe(submission.requestId);
    expect(listResult.ok && listResult.data.items).toHaveLength(1);
  });

  it('باید Submission را به‌روزرسانی و با شناسه، تاریخ و نسخه Mapping فیلتر کند', async () => {
    const client = await createClient();
    const repository = createSubmissionRepository(client);
    const submission: Submission = {
      id: '44444444-4444-4444-8444-444444444444',
      createdAt: '2026-08-04T00:00:00.000Z',
      createdAtJalali: '1405/05/13 10:00',
      requestId: '55555555-5555-4555-8555-555555555555',
      request: {
        businessId: 'PASSARGAD',
        sysName: 'CORE',
        fraudMessageId: 'FR-FILTER-1',
        attrsList: [{ '951': '5' }],
      },
      durationMs: 0,
      status: 'pending',
      mappingVersion: '2.0.0',
      transactionSnapshot: sampleTransaction,
      legCount: 1,
      fraudMessageId: 'FR-FILTER-1',
    };

    const createResult = await repository.create(submission);
    const updateResult = await repository.update(submission.id, {
      response: { referenceId: 'REF-1', status: 'accepted', receivedAt: '2026-08-04T00:00:01.000Z' },
      httpStatus: 200,
      durationMs: 42,
      status: 'success',
    });
    const filteredResult = await repository.list({ query: 'FILTER', dateFrom: '1405/05/13', dateTo: '1405/05/13 23:59', mappingVersion: '2.0.0', status: 'success' }, 1, 10);

    expect(createResult.ok).toBe(true);
    expect(updateResult.ok).toBe(true);
    expect(filteredResult.ok && filteredResult.data.items[0]?.httpStatus).toBe(200);
    expect(filteredResult.ok && filteredResult.data.items[0]?.durationMs).toBe(42);
  });
});
