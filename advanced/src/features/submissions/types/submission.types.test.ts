/**
 * هدف فایل: تست قرارداد Audit/Submission با Payload و Snapshot معتبر.
 * جایگاه معماری: تست واحد Zod برای features/submissions.
 */
import { describe, expect, it } from 'vitest';

import { submissionSchema } from './submission.types';

const sampleTransaction = {
  mainTransaction: {
    fraudMessageId: 'FR-1',
    sysName: 'CORE',
    businessId: 'PASSARGAD',
    attrsList: [{ AccountId: '1', TransactionAmount: '1000', TransactionDate: '2026-08-04 12:00:00' }],
  },
};

describe('submissionSchema', () => {
  it('باید رکورد Submission معتبر را قبول کند', () => {
    const submission = {
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
      durationMs: 120,
      status: 'success',
      mappingVersion: '1.0.0',
      transactionSnapshot: sampleTransaction,
      legCount: 3,
      fraudMessageId: '1403082116532207730195',
    };

    expect(submissionSchema.safeParse(submission).success).toBe(true);
  });
});
