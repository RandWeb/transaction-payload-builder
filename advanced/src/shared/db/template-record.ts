/**
 * هدف فایل: قرارداد Zod رکورد قالب تراکنش بدون وابستگی shared به featureها.
 * جایگاه معماری: shared/db و منبع مشترک Repository و feature templates.
 */
import { z } from 'zod';

const transactionValueSchema = z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]);
const transactionLegSchema = z.record(z.string().min(1), transactionValueSchema);

export const templateTransactionSchema = z.object({
  mainTransaction: z.object({
    fraudMessageId: z.string().min(1, 'شناسه پیام Fraud الزامی است.'),
    sysName: z.string().min(1, 'نام سیستم الزامی است.'),
    businessId: z.string().min(1, 'شناسه کسب‌وکار الزامی است.'),
    attrsList: z.array(transactionLegSchema).min(1, 'حداقل یک تراکنش باید وجود داشته باشد.'),
  }),
});

export const templateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'نام قالب الزامی است.').max(80, 'نام قالب بیش از حد طولانی است.'),
  description: z.string().max(500, 'توضیح قالب بیش از حد طولانی است.').optional(),
  transaction: templateTransactionSchema,
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export type Template = z.infer<typeof templateSchema>;
