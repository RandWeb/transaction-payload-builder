/**
 * هدف فایل: ساخت مقدارهای پیش‌فرض تراکنش مطابق ساختار دقیق `docs/transaction.json`.
 * جایگاه معماری: features/transactions/utils و ابزار کمکی ویرایشگر تراکنش.
 */
import type { Transaction, TransactionLeg } from '@/features/transactions';

/**
 * یک ردیف Attribute خالی اما معتبر برای `attrsList` می‌سازد.
 *
 * @returns ردیف تراکنش با فیلدهای حداقلی مورد نیاز Schema.
 */
export function createEmptyTransactionLeg(): TransactionLeg {
  return {
    AccountId: '',
    TransactionAmount: '0',
    TransactionDate: new Date().toISOString(),
  };
}

/**
 * یک تراکنش خالی با wrapper واقعی `mainTransaction` می‌سازد.
 *
 * @returns تراکنش مطابق ساختار `docs/transaction.json`.
 */
export function createEmptyTransaction(): Transaction {
  return {
    mainTransaction: {
      fraudMessageId: crypto.randomUUID(),
      sysName: 'CORE',
      businessId: 'PASSARGAD',
      attrsList: [createEmptyTransactionLeg()],
    },
  };
}

