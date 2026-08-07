/**
 * هدف فایل: API ارسال Payload تراکنش به سرویس مقصد یا Mock API.
 * جایگاه معماری: features/submissions/api و مرز ارتباط Feature ارسال با shared/api.
 */
import { env } from '@/config/env';
import type { Payload } from '@/features/payload';
import { httpClient } from '@/shared/api/http-client';
import type { Result } from '@/shared/types/result.types';
import { submissionResponseSchema, type SubmissionMeta, type SubmissionResponse } from '../types/submission.types';

export interface SubmitTransactionSuccess {
  readonly response: SubmissionResponse;
  readonly requestId: string;
  readonly durationMs: number;
  readonly httpStatus: number;
  readonly mappingVersion: string;
}

export interface SubmitTransactionOptions {
  readonly requestId?: string;
  readonly signal?: AbortSignal;
}

/**
 * Payload نهایی را به endpoint تراکنش ارسال می‌کند.
 *
 * @param payload - Payload کددارد آماده ارسال.
 * @param meta - metadata لازم برای Audit.
 * @returns پاسخ معتبر سرویس همراه با requestId و مدت زمان.
 */
export async function submitTransaction(payload: Payload, meta: SubmissionMeta, options: SubmitTransactionOptions = {}): Promise<Result<SubmitTransactionSuccess>> {
  const result = await httpClient.request({
    path: env.VITE_TRANSACTION_ENDPOINT,
    method: 'POST',
    body: payload,
    responseSchema: submissionResponseSchema,
    requestId: options.requestId,
    signal: options.signal,
  });

  if (!result.ok) return result;
  return {
    ok: true,
    data: {
      response: result.data.data,
      requestId: result.data.requestId,
      durationMs: result.data.durationMs,
      httpStatus: result.data.httpStatus,
      mappingVersion: meta.mappingVersion,
    },
  };
}
