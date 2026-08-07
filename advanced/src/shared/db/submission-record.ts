/**
 * هدف فایل: قرارداد Zod رکورد Audit ارسال بدون وابستگی shared به featureها.
 * جایگاه معماری: shared/db و منبع مشترک Repository و feature submissions.
 */
import { z } from 'zod';

const auditValueSchema = z.union([z.string(), z.array(z.string())]);
const transactionValueSchema = z.union([z.string(), z.array(z.string())]);

const payloadLegSchema = z.record(z.string().regex(/^(95[1-9]|9[6-9]\d|1000)$/), auditValueSchema);
const transactionLegSchema = z.record(z.string().min(1), transactionValueSchema);

const fraudMessageSchema = z.object({
  mainTransaction: z.object({
    fraudMessageId: z.string().min(1),
    sysName: z.string().min(1),
    businessId: z.string().min(1),
    attrsList: z.array(transactionLegSchema).min(1),
  }),
});

const payloadSchema = z.object({
  businessId: z.string().min(1),
  sysName: z.string().min(1),
  fraudMessageId: z.string().min(1),
  attrsList: z.array(payloadLegSchema).min(1),
});

export const submissionSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().min(1),
  createdAtJalali: z.string().min(1),
  requestId: z.string().uuid(),
  request: payloadSchema,
  response: z.unknown().optional(),
  error: z.unknown().optional(),
  httpStatus: z.number().int().optional(),
  durationMs: z.number().int().nonnegative(),
  status: z.enum(['pending', 'success', 'failed', 'cancelled']),
  mappingVersion: z.string().min(1),
  transactionSnapshot: fraudMessageSchema,
  legCount: z.number().int().positive(),
  fraudMessageId: z.string().min(1),
});

export const submissionResponseSchema = z.object({
  referenceId: z.string().min(1),
  status: z.enum(['accepted', 'rejected']).default('accepted'),
  receivedAt: z.string().min(1),
  message: z.string().optional(),
});

export interface SubmissionMeta {
  readonly mappingVersion: string;
}

export type Submission = z.infer<typeof submissionSchema>;
export type SubmissionResponse = z.infer<typeof submissionResponseSchema>;
