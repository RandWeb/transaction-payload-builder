/**
 * هدف فایل: خواندن صفحه‌بندی‌شده تاریخچه ارسال از SQLite با TanStack Query.
 * جایگاه معماری: features/submissions/hooks و لایه خواندن Audit برای UI.
 */
import { useQuery } from '@tanstack/react-query';

import type { SubmissionFilter, SubmissionPage } from '@/shared/db';
import { createSubmissionRepository } from '@/shared/db/repositories/submission.repository';
import { getSqliteClient } from '@/shared/db/sqlite-client';
import type { Result } from '@/shared/types/result.types';

/**
 * تاریخچه ارسال را بر اساس فیلتر و صفحه فعلی می‌خواند.
 *
 * @param filter - فیلترهای جدول تاریخچه.
 * @param page - شماره صفحه.
 * @param pageSize - اندازه صفحه.
 * @returns Query شامل صفحه Submissionها.
 */
export function useSubmissionHistory(filter: SubmissionFilter, page: number, pageSize: number) {
  return useQuery<Result<SubmissionPage>>({
    queryKey: ['submissions', filter, page, pageSize],
    queryFn: async () => {
      const client = await getSqliteClient();
      if (!client.ok) return client;
      return createSubmissionRepository(client.data).list(filter, page, pageSize);
    },
  });
}
