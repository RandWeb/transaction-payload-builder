/**
 * هدف فایل: ابزارهای Pure برای ماسک Snapshot و خروجی گرفتن از تاریخچه ارسال.
 * جایگاه معماری: features/submissions/utils و بدون وابستگی به UI.
 */
import type { Submission } from '@/features/submissions';
import type { Transaction, TransactionLeg, TransactionValue } from '@/features/transactions';
import { maskSensitive } from '@/shared/lib/format';

const sensitiveNamePattern = /(card|iban|national|account|deposit|pin|id|uid|number)/i;

const maskValue = (name: string, value: TransactionValue): TransactionValue => {
  if (!sensitiveNamePattern.test(name)) return value;
  if (Array.isArray(value)) return value.map((item) => maskSensitive(item, 'text'));
  if (typeof value === 'boolean') return value;
  return maskSensitive(value, 'text');
};

const maskLeg = (leg: TransactionLeg): TransactionLeg =>
  Object.fromEntries(Object.entries(leg).map(([name, value]) => [name, maskValue(name, value)]));

/**
 * Snapshot تراکنش را برای Audit بدون افشای داده حساس آماده می‌کند.
 *
 * @param transaction - تراکنش فعلی کاربر.
 * @returns Snapshot ماسک‌شده با همان قرارداد `docs/transaction.json`.
 */
export function maskTransactionSnapshot(transaction: Transaction): Transaction {
  return {
    mainTransaction: {
      ...transaction.mainTransaction,
      fraudMessageId: maskSensitive(transaction.mainTransaction.fraudMessageId, 'text'),
      attrsList: transaction.mainTransaction.attrsList.map(maskLeg),
    },
  };
}

/**
 * تاریخچه ارسال را به JSON خوانا تبدیل می‌کند.
 *
 * @param submissions - رکوردهای تاریخچه.
 * @returns متن JSON قابل ذخیره.
 */
export function exportSubmissionsToJson(submissions: readonly Submission[]): string {
  return JSON.stringify(submissions, null, 2);
}

/**
 * تاریخچه ارسال را به CSV ساده تبدیل می‌کند.
 *
 * @param submissions - رکوردهای تاریخچه.
 * @returns متن CSV با ستون‌های اصلی Audit.
 */
export function exportSubmissionsToCsv(submissions: readonly Submission[]): string {
  const header = ['id', 'createdAtJalali', 'fraudMessageId', 'status', 'httpStatus', 'durationMs', 'mappingVersion'];
  const rows = submissions.map((submission) =>
    [
      submission.id,
      submission.createdAtJalali,
      submission.fraudMessageId,
      submission.status,
      submission.httpStatus ?? '',
      submission.durationMs,
      submission.mappingVersion,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(','),
  );
  return [header.join(','), ...rows].join('\n');
}
