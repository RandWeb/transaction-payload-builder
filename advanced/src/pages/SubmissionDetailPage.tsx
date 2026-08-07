/**
 * هدف فایل: صفحه جزئیات یک رکورد Audit ارسال.
 * جایگاه معماری: pages و مقصد مسیر `/history/:id`.
 */
import { useParams } from 'react-router-dom';

import { SubmissionDetail } from '@/features/submissions';
import { PageHeader } from '@/shared/components';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

export default function SubmissionDetailPage(): JSX.Element {
  const { id = 'نامشخص' } = useParams();
  useDocumentTitle(`ارسال ${id}`);
  return (
    <div className="space-y-6">
      <PageHeader title={`جزئیات ارسال ${id}`} subtitle="نمایش کامل رکورد Audit، درخواست، پاسخ و مقایسه Payload." />
      <SubmissionDetail />
    </div>
  );
}
