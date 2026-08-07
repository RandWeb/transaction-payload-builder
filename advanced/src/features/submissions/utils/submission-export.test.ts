/**
 * هدف فایل: تست ابزارهای mask و export تاریخچه ارسال.
 * جایگاه معماری: تست واحد features/submissions/utils بدون وابستگی به UI.
 */
import { describe, expect, it } from 'vitest';

import type { Submission } from '@/features/submissions';
import { exportSubmissionsToCsv, exportSubmissionsToJson, maskTransactionSnapshot } from './submission-export';

const sampleSubmission: Submission = {
  id: '66666666-6666-4666-8666-666666666666',
  createdAt: '2026-08-04T00:00:00.000Z',
  createdAtJalali: '1405/05/13 10:00',
  requestId: '77777777-7777-4777-8777-777777777777',
  request: {
    businessId: 'PASSARGAD',
    sysName: 'CORE',
    fraudMessageId: 'FR-1',
    attrsList: [{ '951': '5' }],
  },
  durationMs: 42,
  status: 'success',
  mappingVersion: '1.0.0',
  transactionSnapshot: {
    mainTransaction: {
      fraudMessageId: 'FR-1',
      sysName: 'CORE',
      businessId: 'PASSARGAD',
      attrsList: [{ AccountId: '1234567890123456' }],
    },
  },
  legCount: 1,
  fraudMessageId: 'FR-1',
};

describe('submission export utils', () => {
  it('باید مقدارهای حساس Snapshot را mask کند', () => {
    const masked = maskTransactionSnapshot({
      mainTransaction: {
        fraudMessageId: '1403082116532207730195',
        sysName: 'CORE',
        businessId: 'PASSARGAD',
        attrsList: [{ AccountId: '1234567890123456', TransactionAmount: '1000' }],
      },
    });

    expect(masked.mainTransaction.fraudMessageId).not.toBe('1403082116532207730195');
    expect(masked.mainTransaction.attrsList[0]?.AccountId).toBe('1234****3456');
    expect(masked.mainTransaction.attrsList[0]?.TransactionAmount).toBe('1000');
  });

  it('باید تاریخچه را به JSON و CSV قابل کپی تبدیل کند', () => {
    const json = exportSubmissionsToJson([sampleSubmission]);
    const csv = exportSubmissionsToCsv([sampleSubmission]);

    expect(JSON.parse(json)).toHaveLength(1);
    expect(csv).toContain('id,createdAtJalali,fraudMessageId,status,httpStatus,durationMs,mappingVersion');
    expect(csv).toContain('"FR-1"');
  });
});
