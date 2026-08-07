/**
 * هدف فایل: نمایش نتیجه آخرین ارسال تراکنش در تب‌های خلاصه، درخواست و پاسخ.
 * جایگاه معماری: features/submissions/components و پنجره بازخورد ارسال.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { Submission } from '@/features/submissions';
import { CopyButton, JsonCodeEditor } from '@/shared/components';
import { Badge, Button, Dialog, Tabs } from '@/shared/components/ui';

export interface SubmissionResultDialogProps {
  readonly submission: Submission | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onRetry: () => void;
}

const statusLabel = (status: Submission['status']): string => {
  if (status === 'success') return 'موفق';
  if (status === 'cancelled') return 'لغوشده';
  if (status === 'pending') return 'در انتظار';
  return 'ناموفق';
};

const extractReferenceId = (response: unknown): string => {
  if (typeof response !== 'object' || response === null || !('referenceId' in response)) return '—';
  const reference = response.referenceId;
  return typeof reference === 'string' || typeof reference === 'number' ? String(reference) : '—';
};

/**
 * نتیجه ارسال را برای بازبینی سریع کاربر نمایش می‌دهد.
 *
 * @param props - رکورد Submission و اکشن‌های دیالوگ.
 * @returns دیالوگ نتیجه ارسال.
 */
export function SubmissionResultDialog({ submission, isOpen, onClose, onRetry }: SubmissionResultDialogProps): JSX.Element {
  const [activeTab, setActiveTab] = useState('summary');
  if (submission === null) return <></>;

  const responseText = JSON.stringify(submission.response ?? submission.error ?? {}, null, 2);

  return (
    <Dialog
      isOpen={isOpen}
      title="نتیجه ارسال تراکنش"
      onClose={onClose}
      footer={(
        <>
          <Button type="button" variant="outline" onClick={onRetry}>تلاش مجدد</Button>
          <Link className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm text-primary underline" to={`/history/${submission.id}`}>مشاهده در تاریخچه</Link>
          <Button type="button" variant="ghost" onClick={onClose}>بستن</Button>
        </>
      )}
    >
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        items={[
          {
            value: 'summary',
            label: 'خلاصه',
            content: (
              <div className="space-y-3 text-sm">
                <Badge variant={submission.status === 'success' ? 'success' : submission.status === 'cancelled' ? 'warning' : 'error'}>{statusLabel(submission.status)}</Badge>
                <p>کد HTTP: {submission.httpStatus ?? '—'}</p>
                <p>مدت‌زمان: {submission.durationMs}ms</p>
                <p>referenceId: <code dir="ltr">{extractReferenceId(submission.response)}</code></p>
                <p>requestId: <code dir="ltr">{submission.requestId}</code></p>
              </div>
            ),
          },
          { value: 'request', label: 'درخواست', content: <div className="space-y-2"><CopyButton text={JSON.stringify(submission.request, null, 2)} /><JsonCodeEditor value={JSON.stringify(submission.request, null, 2)} readOnly /></div> },
          { value: 'response', label: 'پاسخ', content: <div className="space-y-2"><CopyButton text={responseText} label="کپی گزارش خطا" /><JsonCodeEditor value={responseText} readOnly /></div> },
        ]}
      />
    </Dialog>
  );
}
