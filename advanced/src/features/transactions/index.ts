/**
 * هدف فایل: API عمومی Feature تراکنش برای مصرف کنترل‌شده توسط Feature های دیگر.
 * جایگاه معماری: مرز عمومی features/transactions.
 */
export { fraudMessageSchema, transactionLegSchema, transactionSchema } from './schemas/transaction.schema';
export type { FraudMessage, Transaction, TransactionLeg, TransactionValue } from './types/transaction.types';
export { default as sampleTransaction } from './data/sample-transaction.json';
export { parseTransactionJson } from './utils/transaction-normalizer';
