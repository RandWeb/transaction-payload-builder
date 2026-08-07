/**
 * هدف فایل: صفحه مدیریت قالب‌های تراکنش.
 * جایگاه معماری: pages و مقصد مسیر `/templates`.
 */
import { TemplateList } from '@/features/templates';
import { PageHeader } from '@/shared/components';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

export default function TemplatesPage(): JSX.Element {
  useDocumentTitle('قالب‌ها');
  return (
    <div className="space-y-6">
      <PageHeader title="قالب‌ها" subtitle="ذخیره، بارگذاری و مدیریت سناریوهای پرتکرار تراکنش." />
      <TemplateList />
    </div>
  );
}
