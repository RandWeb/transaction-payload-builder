/**
 * هدف فایل: نمایش صفحه 404 فارسی برای مسیرهای نامعتبر.
 * جایگاه معماری: pages و fallback router.
 */
import { Link } from 'react-router-dom';

import { Button } from '@/shared/components/ui/Button';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

export default function NotFoundPage(): JSX.Element {
  useDocumentTitle('صفحه پیدا نشد');
  return (
    <section className="rounded-xl border border-border bg-surface p-8 text-center">
      <h1 className="text-3xl font-bold">صفحه پیدا نشد</h1>
      <p className="mt-3 text-secondary">مسیر واردشده در برنامه وجود ندارد.</p>
      <Link to="/workspace">
        <Button className="mt-6">بازگشت به میز کار</Button>
      </Link>
    </section>
  );
}
