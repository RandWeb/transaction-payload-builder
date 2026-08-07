/**
 * هدف فایل: خروجی گرفتن تراکنش فعلی به JSON قابل import مجدد.
 * جایگاه معماری: features/transactions/components و پنل export برای Workspace.
 */
import { useMemo, useState } from 'react';

import type { Transaction, TransactionLeg } from '@/features/transactions';
import { CopyButton, JsonCodeEditor } from '@/shared/components';
import { Button, Checkbox } from '@/shared/components/ui';
import { downloadJson, minifyJson, prettyJson } from '@/shared/lib/json';
import { formatJalaliDateTime } from '@/shared/lib/format';

export interface TransactionJsonExportProps {
  readonly transaction: Transaction;
}

const sanitizeFilenamePart = (value: string): string => value.replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '') || 'transaction';

const removeEmptyFieldsFromLeg = (leg: TransactionLeg): TransactionLeg =>
  Object.fromEntries(
    Object.entries(leg).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.trim().length > 0;
      return true;
    }),
  ) as TransactionLeg;

const buildExportTransaction = (transaction: Transaction, shouldRemoveEmptyFields: boolean): Transaction =>
  shouldRemoveEmptyFields
    ? {
        mainTransaction: {
          ...transaction.mainTransaction,
          attrsList: transaction.mainTransaction.attrsList.map(removeEmptyFieldsFromLeg),
        },
      }
    : transaction;

/**
 * پنل خروجی JSON را با پیش‌نمایش، کپی، دانلود و گزینه‌های فرمت نمایش می‌دهد.
 *
 * @param props - تراکنش فعلی قابل export.
 * @returns ابزار export تراکنش.
 */
export function TransactionJsonExport({ transaction }: TransactionJsonExportProps): JSX.Element {
  const [isPretty, setIsPretty] = useState(true);
  const [removeEmptyFields, setRemoveEmptyFields] = useState(false);

  const exportTransaction = useMemo(() => buildExportTransaction(transaction, removeEmptyFields), [removeEmptyFields, transaction]);
  const exportText = useMemo(() => (isPretty ? prettyJson(exportTransaction) : minifyJson(exportTransaction)), [exportTransaction, isPretty]);
  const filename = useMemo(() => {
    const transactionId = sanitizeFilenamePart(transaction.mainTransaction.fraudMessageId);
    const jalaliDateTime = sanitizeFilenamePart(formatJalaliDateTime(new Date()));
    return `transaction-${transactionId}-${jalaliDateTime}.json`;
  }, [transaction.mainTransaction.fraudMessageId]);

  return (
    <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <div>
        <h2 className="text-lg font-semibold text-text">خروجی transaction.json</h2>
        <p className="text-sm text-secondary">خروجی با همان wrapper `mainTransaction` ساخته می‌شود و دوباره قابل Import است.</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <Checkbox label="خروجی خوانا Pretty" checked={isPretty} onChange={(event) => setIsPretty(event.target.checked)} />
        <Checkbox label="حذف فیلدهای خالی هنگام خروجی" checked={removeEmptyFields} onChange={(event) => setRemoveEmptyFields(event.target.checked)} />
      </div>

      <JsonCodeEditor value={exportText} readOnly />

      <div className="flex flex-wrap items-center gap-2">
        <CopyButton text={exportText} label="کپی JSON" />
        <Button type="button" onClick={() => downloadJson(exportText, filename)}>دانلود JSON</Button>
        <span className="text-xs text-secondary" dir="ltr">{filename}</span>
      </div>
    </section>
  );
}
