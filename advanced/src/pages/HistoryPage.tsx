/**
 * هدف فایل: صفحه تاریخچه ارسال و Audit تراکنش‌ها.
 * جایگاه معماری: pages و مقصد مسیر `/history`.
 */
import { SubmissionHistoryTable } from '@/features/submissions';
import { PageHeader } from '@/shared/components';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

export default function HistoryPage(): JSX.Element {
  useDocumentTitle('تاریخچه ارسال');
  return (
    <div className="space-y-6">
      <PageHeader title="تاریخچه ارسال" subtitle="Audit کامل درخواست، پاسخ، خطا، نسخه Mapping و Snapshot هر ارسال." />
      <SubmissionHistoryTable />
    </div>
  );
}
