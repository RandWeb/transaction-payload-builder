/**
 * هدف فایل: نمایش زنده مشکلات Mapping نسبت به تراکنش فعلی.
 * جایگاه معماری: features/mappings/components و پنل اعتبارسنجی.
 */
import { Badge } from '@/shared/components/ui';
import type { MappingIssue } from '../utils/mapping-manager';

export interface MappingValidationPanelProps {
  readonly issues: readonly MappingIssue[];
  readonly onSelectCode?: (code: string) => void;
}

const variantBySeverity = {
  error: 'error',
  warning: 'warning',
  info: 'info',
} as const;

/**
 * خطاها، هشدارها و اطلاع‌رسانی‌های Mapping را قابل کلیک نمایش می‌دهد.
 *
 * @param props - فهرست مشکلات و callback انتخاب کد.
 * @returns پنل وضعیت اعتبارسنجی.
 */
export function MappingValidationPanel({ issues, onSelectCode }: MappingValidationPanelProps): JSX.Element {
  const errorCount = issues.filter((issue) => issue.severity === 'error').length;
  const warningCount = issues.filter((issue) => issue.severity === 'warning').length;

  return (
    <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-text">اعتبارسنجی Mapping</h2>
        <div className="flex gap-2">
          <Badge variant={errorCount === 0 ? 'success' : 'error'}>{errorCount} خطا</Badge>
          <Badge variant={warningCount === 0 ? 'success' : 'warning'}>{warningCount} هشدار</Badge>
        </div>
      </div>
      <div className="max-h-72 space-y-2 overflow-auto">
        {issues.length === 0 ? <p className="text-sm text-secondary">مشکلی پیدا نشد.</p> : null}
        {issues.map((issue, index) => (
          <button
            key={`${issue.severity}-${issue.code ?? issue.sourceField ?? index}`}
            type="button"
            className="flex w-full items-start justify-between gap-3 rounded-xl border border-border p-3 text-start text-sm hover:bg-muted"
            onClick={() => { if (issue.code !== undefined) onSelectCode?.(issue.code); }}
          >
            <span>
              <span className="block font-medium text-text">{issue.code ?? issue.sourceField ?? 'Mapping'}</span>
              <span className="block text-secondary">{issue.message}</span>
            </span>
            <Badge variant={variantBySeverity[issue.severity]}>{issue.severity}</Badge>
          </button>
        ))}
      </div>
    </section>
  );
}
