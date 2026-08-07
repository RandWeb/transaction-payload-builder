/**
 * هدف فایل: صفحه موقت نمایش کامپوننت‌های shared/ui برای بررسی دستی تسک 03.
 * جایگاه معماری: لایه app و فقط برای پیش‌نمایش توسعه‌ای تا قبل از تسک‌های Routing.
 */
import { Info } from 'lucide-react';

import { AppError } from '@/shared/api/api-error';
import { CopyButton, EmptyState, ErrorAlert, JsonCodeEditor, PageHeader } from '@/shared/components';
import { Badge, Button, Checkbox, Dialog, Input, Select, Skeleton, Spinner, Switch, Table, TableContainer, TBody, TD, TH, THead, TR, Tabs, Textarea, Tooltip } from '@/shared/components/ui';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import { useToast } from '@/shared/hooks/useToast';

/**
 * همه کامپوننت‌های پایه را برای بررسی دستی در مسیر `/__ui` نمایش می‌دهد.
 *
 * @returns صفحه پیش‌نمایش کامپوننت‌های مشترک.
 * @example
 * <UiPreviewPage />
 */
export function UiPreviewPage(): JSX.Element {
  const dialog = useDisclosure();
  const { showToast } = useToast();

  return (
    <main className="min-h-dvh bg-bg p-4 text-text md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <PageHeader title="پیش‌نمایش UI" subtitle="صفحه موقت برای بررسی کامپوننت‌های مشترک در تم روشن و تاریک" />
        <section className="grid gap-4 rounded-xl border border-border bg-surface p-4 md:grid-cols-2">
          <Input label="شناسه تراکنش" hint="نمونه: TRX-1405-0001" />
          <Select label="وضعیت" placeholder="انتخاب کنید" options={[{ value: 'ok', label: 'موفق' }]} />
          <Textarea label="توضیحات" showCount maxLength={100} value="نمونه متن" readOnly />
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={dialog.open}>نمایش Dialog</Button>
            <Button isLoading>در حال ارسال</Button>
            <Tooltip content="متن راهنما"><Button variant="outline">Tooltip</Button></Tooltip>
            <CopyButton text="FraudTransactionForge" />
          </div>
          <Checkbox label="گزینه فعال" hint="قابل استفاده با Space" />
          <Switch checked label="Mock API فعال" />
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">موفق</Badge>
            <Badge variant="warning">هشدار</Badge>
            <Badge variant="error">خطا</Badge>
            <Badge variant="info">اطلاع</Badge>
          </div>
          <Button variant="secondary" onClick={() => showToast({ type: 'success', message: 'پیام با موفقیت نمایش داده شد.' })}>
            نمایش Toast
          </Button>
        </section>
        <Tabs
          value="json"
          onChange={() => undefined}
          items={[
            { value: 'json', label: 'JSON', content: <JsonCodeEditor value={'{\\n  "951": "5"\\n}'} readOnly /> },
            { value: 'empty', label: 'خالی', content: <EmptyState icon={<Info className="size-6" />} title="داده‌ای وجود ندارد" description="این یک حالت خالی نمونه است." /> },
          ]}
        />
        <TableContainer>
          <Table>
            <THead><TR><TH>کد</TH><TH>عنوان</TH><TH>وضعیت</TH></TR></THead>
            <TBody><TR><TD>951</TD><TD>نوع ابزار مبدا</TD><TD><Badge variant="success">فعال</Badge></TD></TR></TBody>
          </Table>
        </TableContainer>
        <ErrorAlert error={AppError.validation('یک خطای نمونه برای بررسی نمایش فارسی رخ داده است.')} />
        <Spinner />
        <Skeleton className="h-8 w-48" />
      </div>
      <Dialog isOpen={dialog.isOpen} title="دیالوگ نمونه" onClose={dialog.close}>
        <p className="text-secondary">این دیالوگ با Escape بسته می‌شود و Focus را برمی‌گرداند.</p>
      </Dialog>
    </main>
  );
}
