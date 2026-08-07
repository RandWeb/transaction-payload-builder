/**
 * هدف فایل: تایپ‌های مشتق‌شده تراکنش از Schemaهای Zod.
 * جایگاه معماری: features/transactions/types و بدون تعریف دستی همپوشان.
 */
import type { z } from 'zod';

import type { fraudMessageSchema, transactionLegSchema, transactionSchema } from '../schemas/transaction.schema';

export type TransactionValue = z.infer<typeof transactionLegSchema>[string];
export type TransactionLeg = z.infer<typeof transactionLegSchema>;
export type FraudMessage = z.infer<typeof fraudMessageSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
