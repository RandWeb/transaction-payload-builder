/**
 * هدف فایل: نمایش جزئیات کامل یک رکورد Audit ارسال.
 * جایگاه معماری: features/submissions/components و صفحه `/history/:id`.
 */
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';

import { PayloadDiffViewer } from '@/features/payload';
import { CopyButton, EmptyState, JsonCodeEditor } from '@/shared/components';
import { Badge, Tabs } from '@/shared/components/ui';
import { createSubmissionRepository } from '@/shared/db/repositories/submission.repository';
import { getSqliteClient } from '@/shared/db/sqlite-client';
import { useBuiltPayload, useTransactionActions } from '@/stores';
import { useState } from 'react';

/**
 * رکورد Submission را بر اساس شناسه مسیر می‌خواند و نمایش می‌دهد.
 *
 * @returns نمای جزئیات Audit.
 */
export function SubmissionDetail(): JSX.Element {
  const { id = '' } = useParams();
  const [activeTab, setActiveTab] = useState('summary');
  const builtPayload = useBuiltPayload();
  const { setDraftTransaction } = useTransactionActions();
  const submission = useQuery({
    queryKey: ['submission', id],
    queryFn: async () => {
      const client = await getSqliteClient();
      if (!client.ok) return client;
      return createSubmissionRepository(client.data).getById(id);
    },
  });

  if (submission.isLoading) return <p className="text-sm text-secondary">در حال خواندن جزئیات...</p>;
  if (submission.data !== undefined && !submission.data.ok) return <EmptyState title="خواندن جزئیات ناموفق بود" description={submission.data.error.messageFa} />;
  const item = submission.data?.ok ? submission.data.data : null;
  if (item === null) return <EmptyState title="رکوردی پیدا نشد" action={<Link className="text-primary underline" to="/history">بازگشت به تاریخچه</Link>} />;

  const responseText = JSON.stringify(item.response ?? item.error ?? {}, null, 2);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-4">
        <Badge variant={item.status === 'success' ? 'success' : 'error'}>{item.status}</Badge>
        <span>HTTP: {item.httpStatus ?? '—'}</span>
        <span>requestId: <code>{item.requestId}</code></span>
        <button type="button" className="text-primary underline" onClick={() => setDraftTransaction(item.transactionSnapshot)}>بارگذاری مجدد در میز کار</button>
      </div>
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        items={[
          { value: 'summary', label: 'خلاصه', content: <JsonCodeEditor value={JSON.stringify(item, null, 2)} readOnly /> },
          { value: 'request', label: 'درخواست', content: <div className="space-y-2"><CopyButton text={JSON.stringify(item.request, null, 2)} /><JsonCodeEditor value={JSON.stringify(item.request, null, 2)} readOnly /></div> },
          { value: 'response', label: 'پاسخ', content: <div className="space-y-2"><CopyButton text={responseText} label="کپی پاسخ" /><JsonCodeEditor value={responseText} readOnly /></div> },
          { value: 'diff', label: 'مقایسه', content: <PayloadDiffViewer before={item.request} after={builtPayload} /> },
        ]}
      />
    </div>
  );
}
