/**
 * هدف فایل: نمایش صفحه‌بندی‌شده تاریخچه Audit ارسال‌ها.
 * جایگاه معماری: features/submissions/components و جدول/کارت responsive برای `/history`.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { Submission } from '@/features/submissions';
import { ConfirmDialog, CopyButton, EmptyState } from '@/shared/components';
import { Badge, Button, Table, TableContainer, TBody, TD, TH, THead, TR } from '@/shared/components/ui';
import type { SubmissionFilter } from '@/shared/db';
import { createSubmissionRepository } from '@/shared/db/repositories/submission.repository';
import { getSqliteClient } from '@/shared/db/sqlite-client';
import { useToast } from '@/shared/hooks/useToast';
import { toPersianDigits } from '@/shared/lib/format';
import { useTransactionActions } from '@/stores';
import { useSubmissionHistory } from '../hooks/useSubmissionHistory';
import { exportSubmissionsToCsv, exportSubmissionsToJson } from '../utils/submission-export';
import { SubmissionFilters } from './SubmissionFilters';

const pageSize = 10;

const statusVariant = (status: Submission['status']): 'success' | 'warning' | 'error' | 'neutral' => {
  if (status === 'success') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'cancelled') return 'neutral';
  return 'error';
};

const statusLabel = (status: Submission['status']): string => {
  if (status === 'success') return 'موفق';
  if (status === 'pending') return 'در انتظار';
  if (status === 'cancelled') return 'لغوشده';
  return 'ناموفق';
};

/**
 * جدول تاریخچه ارسال را با فیلتر، صفحه‌بندی، replay، export و پاک‌سازی نمایش می‌دهد.
 *
 * @returns نمای تاریخچه ارسال.
 */
export function SubmissionHistoryTable(): JSX.Element {
  const [filter, setFilter] = useState<SubmissionFilter>({});
  const [page, setPage] = useState(1);
  const [isClearOpen, setIsClearOpen] = useState(false);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { setDraftTransaction } = useTransactionActions();
  const history = useSubmissionHistory(filter, page, pageSize);
  const submissions = history.data?.ok ? history.data.data.items : [];

  const replaySubmission = (submission: Submission): void => {
    setDraftTransaction(submission.transactionSnapshot);
    showToast({ type: 'success', message: 'Snapshot ارسال در میز کار بارگذاری شد.' });
  };

  const clearHistory = async (): Promise<void> => {
    const client = await getSqliteClient();
    if (!client.ok) {
      showToast({ type: 'error', message: client.error.messageFa });
      return;
    }
    const result = await createSubmissionRepository(client.data).deleteAll();
    if (!result.ok) {
      showToast({ type: 'error', message: result.error.messageFa });
      return;
    }
    setIsClearOpen(false);
    showToast({ type: 'success', message: 'تاریخچه ارسال پاک‌سازی شد.' });
    void queryClient.invalidateQueries({ queryKey: ['submissions'] });
  };

  if (history.isLoading) return <p className="text-sm text-secondary">در حال خواندن تاریخچه...</p>;
  if (history.data !== undefined && !history.data.ok) return <EmptyState title="خواندن تاریخچه ناموفق بود" description={history.data.error.messageFa} />;

  return (
    <div className="space-y-4">
      <SubmissionFilters filter={filter} onChange={(nextFilter) => { setFilter(nextFilter); setPage(1); }} />
      <div className="flex flex-wrap gap-2">
        <CopyButton text={exportSubmissionsToJson(submissions)} label="Export JSON" />
        <CopyButton text={exportSubmissionsToCsv(submissions)} label="Export CSV" />
        <Button type="button" variant="danger" disabled={submissions.length === 0} onClick={() => setIsClearOpen(true)}>پاک‌سازی تاریخچه</Button>
      </div>
      {submissions.length === 0 ? <EmptyState title="ارسالی ثبت نشده است" /> : null}
      <div className="grid gap-3 md:hidden">
        {submissions.map((submission) => (
          <article key={submission.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <Badge variant={statusVariant(submission.status)}>{statusLabel(submission.status)}</Badge>
              <span className="text-xs text-secondary">{submission.createdAtJalali}</span>
            </div>
            <p className="mt-2 text-sm">{submission.fraudMessageId}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link className="text-sm text-primary underline" to={`/history/${submission.id}`}>جزئیات</Link>
              <button type="button" className="text-sm text-primary underline" onClick={() => replaySubmission(submission)}>Replay</button>
              <CopyButton text={JSON.stringify(submission.request, null, 2)} label="کپی Payload" />
            </div>
          </article>
        ))}
      </div>
      <TableContainer className="hidden md:block">
        <Table>
          <THead>
            <TR>
              <TH>تاریخ</TH>
              <TH>شناسه تراکنش</TH>
              <TH>وضعیت</TH>
              <TH>HTTP</TH>
              <TH>مدت</TH>
              <TH>Mapping</TH>
              <TH>عملیات</TH>
            </TR>
          </THead>
          <TBody>
            {submissions.map((submission) => (
              <TR key={submission.id}>
                <TD>{submission.createdAtJalali}</TD>
                <TD><code>{submission.fraudMessageId}</code></TD>
                <TD><Badge variant={statusVariant(submission.status)}>{statusLabel(submission.status)}</Badge></TD>
                <TD>{submission.httpStatus ?? '—'}</TD>
                <TD>{toPersianDigits(submission.durationMs)}ms</TD>
                <TD>{submission.mappingVersion}</TD>
                <TD>
                  <div className="flex flex-wrap gap-2">
                    <Link className="text-primary underline" to={`/history/${submission.id}`}>مشاهده</Link>
                    <button type="button" className="text-primary underline" onClick={() => replaySubmission(submission)}>Replay</button>
                    <CopyButton text={JSON.stringify(submission.request, null, 2)} label="کپی Payload" />
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </TableContainer>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>قبلی</Button>
        <Button type="button" variant="outline" disabled={submissions.length < pageSize} onClick={() => setPage((current) => current + 1)}>بعدی</Button>
      </div>
      <ConfirmDialog
        isOpen={isClearOpen}
        title="پاک‌سازی تاریخچه"
        message="همه رکوردهای Audit ارسال حذف می‌شوند. این عملیات قابل بازگشت نیست."
        confirmLabel="پاک‌سازی"
        cancelLabel="انصراف"
        onConfirm={() => { void clearHistory(); }}
        onCancel={() => setIsClearOpen(false)}
      />
    </div>
  );
}
