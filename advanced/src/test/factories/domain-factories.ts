/**
 * هدف فایل: سازنده‌های داده تستی برای Transaction، Mapping و Submission.
 * جایگاه معماری: src/test/factories و داده مشترک تست‌های واحد/یکپارچه.
 */
import type { Mapping } from '@/features/mappings';
import type { Submission } from '@/features/submissions';
import type { Transaction } from '@/features/transactions';

/**
 * تراکنش تستی معتبر را با override جزئی می‌سازد.
 *
 * @param override - بخش‌هایی از تراکنش که باید جایگزین شوند.
 * @returns تراکنش معتبر.
 */
export function makeTransaction(override: Partial<Transaction['mainTransaction']> = {}): Transaction {
  return {
    mainTransaction: {
      fraudMessageId: 'TEST-FR-1',
      sysName: 'CORE',
      businessId: 'PASSARGAD',
      attrsList: [{ AccountId: '1234567890123456', TransactionAmount: '1000', TransactionDate: '2026-08-04T10:00:00.000Z' }],
      ...override,
    },
  };
}

/**
 * Mapping تستی معتبر را با override جزئی می‌سازد.
 *
 * @param override - کدهای مقصد جایگزین یا اضافه.
 * @returns Mapping خام `code -> sourceField`.
 */
export function makeMapping(override: Partial<Mapping> = {}): Mapping {
  return {
    '951': 'AccountId',
    '952': 'TransactionAmount',
    '953': 'TransactionDate',
    ...override,
  };
}

/**
 * رکورد Submission تستی معتبر را با override جزئی می‌سازد.
 *
 * @param override - فیلدهای جایگزین رکورد.
 * @returns Submission معتبر برای تست repository/UI.
 */
export function makeSubmission(override: Partial<Submission> = {}): Submission {
  const transaction = makeTransaction();
  return {
    id: '99999999-9999-4999-8999-999999999999',
    createdAt: '2026-08-04T10:00:00.000Z',
    createdAtJalali: '1405/05/13 10:00:00',
    requestId: '88888888-8888-4888-8888-888888888888',
    request: {
      businessId: transaction.mainTransaction.businessId,
      sysName: transaction.mainTransaction.sysName,
      fraudMessageId: transaction.mainTransaction.fraudMessageId,
      attrsList: [{ '951': '1234567890123456', '952': '1000', '953': '2026-08-04T10:00:00.000Z' }],
    },
    durationMs: 20,
    status: 'success',
    mappingVersion: '1.0.0',
    transactionSnapshot: transaction,
    legCount: 1,
    fraudMessageId: transaction.mainTransaction.fraudMessageId,
    ...override,
  };
}
