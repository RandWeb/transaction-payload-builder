/**
 * هدف فایل: نمایش یک Attribute تراکنش با وضعیت Mapping و عملیات ویرایش.
 * جایگاه معماری: features/transactions/components و جزء نمایشی لیست Attributeها.
 */
import { Copy, Pencil, Trash2 } from 'lucide-react';

import type { Mapping } from '@/features/mappings';
import type { TransactionValue } from '@/features/transactions';
import { Badge, Button } from '@/shared/components/ui';
import { maskSensitive, toPersianDigits } from '@/shared/lib/format';
import { findTargetCode } from '../utils/transaction-normalizer';

export interface TransactionAttributeCardProps {
  readonly name: string;
  readonly value: TransactionValue;
  readonly activeMapping: Mapping | null;
  readonly onEdit: (name: string) => void;
  readonly onDelete: (name: string) => void;
}

const sensitiveNamePattern = /(Card|Account|Iban|National|Deposit|Beneficiary|Receiver|Owner|Originator)/i;

const formatAttributeValue = (name: string, value: TransactionValue): string => {
  const rawValue = Array.isArray(value) ? value.join(', ') : String(value);
  const displayValue = sensitiveNamePattern.test(name) ? maskSensitive(rawValue) : rawValue;
  return toPersianDigits(displayValue);
};

/**
 * کارت Attribute را با کد مقصد متناظر و مقدار ماسک‌شده نمایش می‌دهد.
 *
 * @param props - نام، مقدار، Mapping و handlerهای عملیات.
 * @returns کارت responsive برای موبایل و دسکتاپ.
 */
export function TransactionAttributeCard({ name, value, activeMapping, onEdit, onDelete }: TransactionAttributeCardProps): JSX.Element {
  const targetCode = findTargetCode(activeMapping, name);

  const copyValue = async (): Promise<void> => {
    await navigator.clipboard.writeText(Array.isArray(value) ? value.join(', ') : String(value));
  };

  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="break-all font-semibold text-text">{name}</h3>
            {targetCode === null ? <Badge variant="warning">نگاشت‌نشده</Badge> : <Badge variant="info">کد {targetCode}</Badge>}
          </div>
          <p className="break-all text-sm text-secondary">{formatAttributeValue(name, value)}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => { void copyValue(); }} aria-label={`کپی ${name}`} rightIcon={<Copy className="size-4" />}>
            کپی
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onEdit(name)} rightIcon={<Pencil className="size-4" />}>
            ویرایش
          </Button>
          <Button type="button" variant="danger" size="sm" onClick={() => onDelete(name)} rightIcon={<Trash2 className="size-4" />}>
            حذف
          </Button>
        </div>
      </div>
    </article>
  );
}
