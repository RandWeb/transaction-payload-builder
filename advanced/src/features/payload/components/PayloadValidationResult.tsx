/**
 * Ù‡Ø¯Ù ÙØ§ÛŒÙ„: Ù†Ù…Ø§ÛŒØ´ Ø®Ø·Ø§Ù‡Ø§ØŒ Ù‡Ø´Ø¯Ø§Ø±Ù‡Ø§ Ùˆ ÙÛŒÙ„Ø¯Ù‡Ø§ÛŒ Ø­Ø°Ùâ€ŒØ´Ø¯Ù‡ Ú¯Ø²Ø§Ø±Ø´ Ø³Ø§Ø®Øª Payload.
 * Ø¬Ø§ÛŒÚ¯Ø§Ù‡ Ù…Ø¹Ù…Ø§Ø±ÛŒ: features/payload/components Ùˆ Ù†Ù…Ø§ÛŒØ´ BuildReport Ø¨Ø¯ÙˆÙ† Ù…Ù†Ø·Ù‚ ØªØ¨Ø¯ÛŒÙ„.
 */
import { AlertCircle, Info, TriangleAlert } from 'lucide-react';

import type { BuildReport, BuildValidationIssue } from '@/features/mappings';
import { Button } from '@/shared/components/ui/Button';

export interface PayloadValidationResultProps {
  readonly report: BuildReport;
  readonly onIssueClick?: (issue: BuildValidationIssue) => void;
}

const emptyMessage = 'Ù…ÙˆØ±Ø¯ÛŒ Ø¨Ø±Ø§ÛŒ Ù†Ù…Ø§ÛŒØ´ ÙˆØ¬ÙˆØ¯ Ù†Ø¯Ø§Ø±Ø¯.';

function ReportSection({ title, icon, count, children }: { readonly title: string; readonly icon: JSX.Element; readonly count: number; readonly children: JSX.Element }): JSX.Element {
  return (
    <details className="rounded-xl border border-border bg-surface p-4" open={count > 0}>
      <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-text">
        <span className="inline-flex items-center gap-2">{icon}{title}</span>
        <span className="text-xs text-secondary">{count}</span>
      </summary>
      <div className="mt-3">{count > 0 ? children : <p className="text-sm text-secondary">{emptyMessage}</p>}</div>
    </details>
  );
}

export function PayloadValidationResult({ report, onIssueClick }: PayloadValidationResultProps): JSX.Element {
  return (
    <div className="space-y-3">
      <ReportSection title="Ø®Ø·Ø§Ù‡Ø§ÛŒ Ù…Ø³Ø¯ÙˆØ¯Ú©Ù†Ù†Ø¯Ù‡" count={report.errors.length} icon={<AlertCircle className="size-4 text-error" aria-hidden="true" />}>
        <ul className="space-y-2">
          {report.errors.map((issue) => (
            <li key={`${issue.code ?? 'issue'}-${issue.sourceField ?? issue.message}`} className="rounded-lg bg-[rgb(var(--color-bg-danger-subtle))] p-3 text-sm text-error">
              <Button type="button" variant="ghost" size="sm" className="justify-start text-error" onClick={() => onIssueClick?.(issue)}>
                {issue.message}
              </Button>
            </li>
          ))}
        </ul>
      </ReportSection>
      <ReportSection title="Ù‡Ø´Ø¯Ø§Ø±Ù‡Ø§ Ùˆ ÙÛŒÙ„Ø¯Ù‡Ø§ÛŒ unmapped" count={report.warnings.length + report.unmappedFields.length} icon={<TriangleAlert className="size-4 text-warning" aria-hidden="true" />}>
        <ul className="space-y-2 text-sm text-secondary">
          {report.warnings.map((issue) => <li key={issue.message}>{issue.message}</li>)}
          {report.unmappedFields.map((field) => <li key={`${field.attrsListIndex}-${field.fieldName}`}>{field.message}</li>)}
        </ul>
      </ReportSection>
      <ReportSection title="ÙÛŒÙ„Ø¯Ù‡Ø§ÛŒ Ø­Ø°Ùâ€ŒØ´Ø¯Ù‡" count={report.omittedFields.length} icon={<Info className="size-4 text-primary" aria-hidden="true" />}>
        <ul className="space-y-2 text-sm text-secondary">
          {report.omittedFields.map((field) => <li key={`${field.code}-${field.sourceField}`}>{field.code} Â· {field.sourceField}: {field.reason}</li>)}
        </ul>
      </ReportSection>
    </div>
  );
}
