/**
 * هدف فایل: اجرای Mutation ارسال تراکنش و ثبت Audit کامل در SQLite.
 * جایگاه معماری: features/submissions/hooks و اتصال Store، Engine، API و Repository.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';

import { buildPayload } from '@/features/mappings';
import { submitTransaction } from '@/features/submissions';
import type { Submission } from '@/features/submissions';
import { AppError } from '@/shared/api/api-error';
import { createRequestId } from '@/shared/api/request-id';
import { createMappingRepository } from '@/shared/db/repositories/mapping.repository';
import { createSubmissionRepository } from '@/shared/db/repositories/submission.repository';
import { getSqliteClient } from '@/shared/db/sqlite-client';
import { formatJalaliDateTime } from '@/shared/lib/format';
import type { Result } from '@/shared/types/result.types';
import { useActiveMapping, useDraftTransaction } from '@/stores';
import { useToast } from '@/shared/hooks/useToast';
import { maskTransactionSnapshot } from '../utils/submission-export';

export interface SubmitTransactionState {
  readonly submit: () => void;
  readonly cancel: () => void;
  readonly isPending: boolean;
  readonly result: Submission | null;
}

const resolveActiveMappingVersion = async (): Promise<Result<string>> => {
  const client = await getSqliteClient();
  if (!client.ok) return client;
  const versions = await createMappingRepository(client.data).listVersions();
  if (!versions.ok) return versions;
  return { ok: true, data: versions.data.find((version) => version.isActive)?.version ?? 'workspace' };
};

/**
 * ارسال تراکنش را با محافظت از Double-submit و ثبت pending/success/failed انجام می‌دهد.
 *
 * @returns وضعیت Mutation، نتیجه آخر و توابع ارسال/لغو.
 */
export function useSubmitTransaction(): SubmitTransactionState {
  const draftTransaction = useDraftTransaction();
  const activeMapping = useActiveMapping();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [result, setResult] = useState<Submission | null>(null);

  const mutation = useMutation({
    mutationKey: ['submit-transaction'],
    mutationFn: async (): Promise<Submission> => {
      if (activeMapping === null) throw AppError.validation('Mapping فعال برای ارسال انتخاب نشده است.');
      const mappingVersion = await resolveActiveMappingVersion();
      if (!mappingVersion.ok) throw mappingVersion.error;
      const builtPayload = buildPayload(draftTransaction, activeMapping, { mappingVersion: mappingVersion.data });
      if (!builtPayload.ok) throw builtPayload.error;

      const client = await getSqliteClient();
      if (!client.ok) throw client.error;
      const repository = createSubmissionRepository(client.data);
      const requestId = createRequestId();
      const createdAt = new Date().toISOString();
      const pendingSubmission: Submission = {
        id: crypto.randomUUID(),
        createdAt,
        createdAtJalali: formatJalaliDateTime(createdAt),
        requestId,
        request: builtPayload.data.payload,
        durationMs: 0,
        status: 'pending',
        mappingVersion: mappingVersion.data,
        transactionSnapshot: maskTransactionSnapshot(draftTransaction),
        legCount: draftTransaction.mainTransaction.attrsList.length,
        fraudMessageId: draftTransaction.mainTransaction.fraudMessageId,
      };
      const createResult = await repository.create(pendingSubmission);
      if (!createResult.ok) throw createResult.error;

      const controller = new AbortController();
      abortControllerRef.current = controller;
      const startedAt = performance.now();
      const apiResult = await submitTransaction(builtPayload.data.payload, { mappingVersion: mappingVersion.data }, { requestId, signal: controller.signal });
      const status: Submission['status'] = controller.signal.aborted ? 'cancelled' : apiResult.ok ? 'success' : 'failed';
      const updateResult = await repository.update(pendingSubmission.id, {
        response: apiResult.ok ? apiResult.data.response : undefined,
        error: apiResult.ok ? undefined : { code: apiResult.error.code, messageFa: apiResult.error.messageFa, details: apiResult.error.details },
        httpStatus: apiResult.ok ? apiResult.data.httpStatus : apiResult.error.httpStatus,
        durationMs: apiResult.ok ? apiResult.data.durationMs : Math.max(1, Math.round(performance.now() - startedAt)),
        status,
      });
      if (!updateResult.ok) throw updateResult.error;

      const saved = await repository.getById(pendingSubmission.id);
      if (!saved.ok) throw saved.error;
      if (saved.data === null) throw AppError.storage('رکورد Audit بعد از ارسال پیدا نشد.');
      return saved.data;
    },
    onSuccess: (submission) => {
      setResult(submission);
      showToast({ type: submission.status === 'success' ? 'success' : 'error', message: submission.status === 'success' ? 'تراکنش با موفقیت ارسال و ثبت شد.' : 'ارسال تراکنش ناموفق بود و در Audit ثبت شد.' });
      void queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
    onError: (error) => {
      showToast({ type: 'error', message: error instanceof Error ? error.message : 'ارسال تراکنش ناموفق بود.' });
    },
    onSettled: () => {
      abortControllerRef.current = null;
    },
  });

  return {
    submit: () => {
      if (!mutation.isPending) mutation.mutate();
    },
    cancel: () => abortControllerRef.current?.abort(),
    isPending: mutation.isPending,
    result,
  };
}
