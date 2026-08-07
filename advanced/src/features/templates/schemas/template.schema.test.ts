/**
 * هدف فایل: تست قرارداد Template با Snapshot تراکنش معتبر.
 * جایگاه معماری: تست واحد Zod برای features/templates.
 */
import { describe, expect, it } from 'vitest';

import { templateSchema } from './template.schema';

const sampleTransaction = {
  mainTransaction: {
    fraudMessageId: 'FR-1',
    sysName: 'CORE',
    businessId: 'PASSARGAD',
    attrsList: [{ AccountId: '1', TransactionAmount: '1000', TransactionDate: '2026-08-04 12:00:00' }],
  },
};

describe('templateSchema', () => {
  it('باید قالب معتبر را قبول کند', () => {
    const template = {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'قالب نمونه',
      description: 'سناریوی تستی',
      transaction: sampleTransaction,
      createdAt: '2026-08-04T00:00:00.000Z',
      updatedAt: '2026-08-04T00:00:00.000Z',
    };

    expect(templateSchema.safeParse(template).success).toBe(true);
  });
});
