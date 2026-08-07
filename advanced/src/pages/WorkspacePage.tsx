/**
 * هدف فایل: صفحه میز کار برای ورود، paste و ویرایش تراکنش مطابق `docs/transaction.json`.
 * جایگاه معماری: pages و مقصد مسیر `/workspace`.
 */
import { WorkspaceLayout } from '@/app/layouts/WorkspaceLayout';
import { PageHeader } from '@/shared/components/PageHeader';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

export default function WorkspacePage(): JSX.Element {
  useDocumentTitle('میز کار');
  return (
    <div className="space-y-6">
      <PageHeader title="میز کار" subtitle="ورود و ویرایش تراکنش با ساختار دقیق mainTransaction و attrsList." />
      <WorkspaceLayout />
    </div>
  );
}

