/**
 * هدف فایل: نمایش Diff دو Mapping خام برای Import یا مقایسه نسخه‌ها.
 * جایگاه معماری: features/mappings/components و کامپوننت نمایشی.
 */
import type { MappingDiff } from '../utils/mapping-manager';

export interface MappingDiffViewerProps {
  readonly diff: MappingDiff;
}

const renderCodes = (codes: readonly string[]): string => (codes.length === 0 ? 'ندارد' : codes.join('، '));

/**
 * خلاصه Diff را در سه گروه افزوده/حذف/تغییر نمایش می‌دهد.
 *
 * @param props - نتیجه Diff.
 * @returns کارت Diff.
 */
export function MappingDiffViewer({ diff }: MappingDiffViewerProps): JSX.Element {
  return (
    <div className="grid gap-3 text-sm md:grid-cols-3">
      <div className="rounded-xl border border-border bg-muted p-3">
        <p className="font-semibold text-success">افزوده‌شده</p>
        <p className="mt-2 text-secondary">{renderCodes(diff.added)}</p>
      </div>
      <div className="rounded-xl border border-border bg-muted p-3">
        <p className="font-semibold text-error">حذف‌شده</p>
        <p className="mt-2 text-secondary">{renderCodes(diff.removed)}</p>
      </div>
      <div className="rounded-xl border border-border bg-muted p-3">
        <p className="font-semibold text-warning">تغییرکرده</p>
        <p className="mt-2 text-secondary">{renderCodes(diff.changed)}</p>
      </div>
    </div>
  );
}
