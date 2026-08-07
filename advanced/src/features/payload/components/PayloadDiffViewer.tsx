/**
 * هدف فایل: نمایش Diff دو Payload به شکل کنارهم در دسکتاپ و خطی در موبایل.
 * جایگاه معماری: features/payload/components و مصرف الگوریتم Pure Diff.
 */
import { MinusCircle, PlusCircle, RefreshCcw } from 'lucide-react';

import type { Payload } from '@/features/payload';
import { Badge } from '@/shared/components/ui/Badge';
import { Table, TableContainer, TBody, TD, TH, THead, TR } from '@/shared/components/ui/Table';
import { diffPayloads, type PayloadDiff, type PayloadDiffKind } from '../utils/payload-formatter';

export interface PayloadDiffViewerProps {
  readonly before: Payload | null;
  readonly after: Payload | null;
}

const diffLabels: Record<PayloadDiffKind, string> = {
  added: 'افزوده',
  removed: 'حذف‌شده',
  changed: 'تغییرکرده',
};

const diffVariants: Record<PayloadDiffKind, 'success' | 'warning' | 'error'> = {
  added: 'success',
  removed: 'error',
  changed: 'warning',
};

const diffIcons: Record<PayloadDiffKind, JSX.Element> = {
  added: <PlusCircle className="size-4" aria-hidden="true" />,
  removed: <MinusCircle className="size-4" aria-hidden="true" />,
  changed: <RefreshCcw className="size-4" aria-hidden="true" />,
};

const valueToText = (value: unknown): string => (value === undefined ? '—' : JSON.stringify(value));

/**
 * یک ردیف Diff را برای موبایل نمایش می‌دهد.
 *
 * @param props - تغییر Payload.
 * @returns کارت خطی موبایل.
 */
function DiffCard({ diff }: { readonly diff: PayloadDiff }): JSX.Element {
  return (
    <article className="rounded-xl border border-border bg-surface p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <code className="break-all text-xs text-secondary">{diff.path}</code>
        <Badge variant={diffVariants[diff.kind]}>{diffIcons[diff.kind]}{diffLabels[diff.kind]}</Badge>
      </div>
      <div className="grid gap-2 text-xs md:grid-cols-2" dir="ltr">
        <pre className="overflow-auto rounded-lg bg-muted p-2">{valueToText(diff.before)}</pre>
        <pre className="overflow-auto rounded-lg bg-muted p-2">{valueToText(diff.after)}</pre>
      </div>
    </article>
  );
}

/**
 * Diff دو Payload را نمایش می‌دهد.
 *
 * @param props - Payload قبلی و جدید.
 * @returns جدول/لیست تغییرات Payload.
 */
export function PayloadDiffViewer({ before, after }: PayloadDiffViewerProps): JSX.Element {
  if (before === null || after === null) return <p className="text-sm text-secondary">برای مقایسه، دو Payload لازم است.</p>;

  const diffs = diffPayloads(before, after);
  if (diffs.length === 0) return <p className="text-sm text-secondary">تفاوتی بین دو Payload وجود ندارد.</p>;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:hidden">
        {diffs.map((diff) => <DiffCard key={`${diff.path}-${diff.kind}`} diff={diff} />)}
      </div>
      <TableContainer className="hidden md:block">
        <Table>
          <THead>
            <TR>
              <TH>نوع</TH>
              <TH>مسیر</TH>
              <TH>قبل</TH>
              <TH>بعد</TH>
            </TR>
          </THead>
          <TBody>
            {diffs.map((diff) => (
              <TR key={`${diff.path}-${diff.kind}`}>
                <TD><Badge variant={diffVariants[diff.kind]}>{diffIcons[diff.kind]}{diffLabels[diff.kind]}</Badge></TD>
                <TD><code className="text-xs">{diff.path}</code></TD>
                <TD><pre className="max-w-xs overflow-auto text-xs" dir="ltr">{valueToText(diff.before)}</pre></TD>
                <TD><pre className="max-w-xs overflow-auto text-xs" dir="ltr">{valueToText(diff.after)}</pre></TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </TableContainer>
    </div>
  );
}
