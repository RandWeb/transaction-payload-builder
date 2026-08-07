/**
 * هدف فایل: دکمه ارسال تراکنش با Confirm، محافظت از ارسال تکراری و لغو درخواست.
 * جایگاه معماری: features/submissions/components و اکشن اصلی ارسال از Workspace.
 */
import { useState } from 'react';

import { ConfirmDialog } from '@/shared/components';
import { Button, Tooltip } from '@/shared/components/ui';
import { env } from '@/config/env';
import { useActiveMapping } from '@/stores';
import { usePayloadPreview } from '@/features/payload';
import { useSubmitTransaction } from '../hooks/useSubmitTransaction';
import { SubmissionResultDialog } from './SubmissionResultDialog';

/**
 * دکمه ارسال نهایی Payload را با خلاصه تأیید نمایش می‌دهد.
 *
 * @returns دکمه ارسال و دیالوگ‌های تأیید/نتیجه.
 */
export function SubmitTransactionButton(): JSX.Element {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const activeMapping = useActiveMapping();
  const preview = usePayloadPreview();
  const submission = useSubmitTransaction();
  const output = preview.result?.ok === true ? preview.result.data : null;
  const disabledReason = activeMapping === null ? 'Mapping فعال انتخاب نشده است.' : output === null ? 'Payload معتبر برای ارسال وجود ندارد.' : output.report.errors.length > 0 ? 'ابتدا خطاهای مسدودکننده Payload را رفع کنید.' : undefined;

  const submit = (): void => {
    submission.submit();
    setIsConfirmOpen(false);
    setIsResultOpen(true);
  };

  return (
    <>
      <Tooltip content={disabledReason ?? `ارسال به ${env.VITE_TRANSACTION_ENDPOINT}`}>
        <Button type="button" disabled={disabledReason !== undefined || submission.isPending} isLoading={submission.isPending} onClick={() => setIsConfirmOpen(true)}>
          {submission.isPending ? 'در حال ارسال...' : 'ارسال تراکنش'}
        </Button>
      </Tooltip>
      {submission.isPending ? <Button type="button" variant="outline" onClick={submission.cancel}>لغو درخواست</Button> : null}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="تأیید ارسال تراکنش"
        message={`تعداد فیلدهای ارسالی: ${output?.report.mappedFields.length ?? 0} · نسخه Mapping: ${output?.mappingVersion ?? 'نامشخص'} · مقصد: ${env.VITE_TRANSACTION_ENDPOINT}`}
        confirmLabel="ارسال"
        onConfirm={submit}
        onCancel={() => setIsConfirmOpen(false)}
      />
      <SubmissionResultDialog submission={submission.result} isOpen={isResultOpen && submission.result !== null} onClose={() => setIsResultOpen(false)} onRetry={submission.submit} />
    </>
  );
}
