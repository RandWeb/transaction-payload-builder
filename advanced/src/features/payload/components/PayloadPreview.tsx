/**
 * هدف فایل: پیش‌نمایش JSON و جدول Payload نهایی پیش از ارسال.
 * جایگاه معماری: features/payload/components و نمای Container برای گزارش موتور Mapping.
 */
import { AlertCircle, Eye, EyeOff, Send } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { BuildOutput, BuildReport } from '@/features/mappings';
import type { Payload, PayloadValue } from '@/features/payload';
import { SubmitTransactionButton } from '@/features/submissions';
import { EmptyState, ErrorAlert, JsonCodeEditor } from '@/shared/components';
import { Badge, Button, Switch, Table, TableContainer, TBody, TD, TH, THead, Tooltip, TR, Tabs } from '@/shared/components/ui';
import { useBuiltPayload, usePayloadActions } from '@/stores';
import { formatJalaliDateTime, toPersianDigits } from '@/shared/lib/format';
import { usePayloadPreview } from '../hooks/usePayloadPreview';
import { estimatePayloadSize, formatPayloadForDisplay } from '../utils/payload-formatter';
import { CopyPayloadButton, type CopyPayloadMode } from './CopyPayloadButton';
import { PayloadDiffViewer } from './PayloadDiffViewer';
import { PayloadValidationResult } from './PayloadValidationResult';

type PreviewTab = 'json' | 'table' | 'validation' | 'diff';

export interface PayloadPreviewProps {
  readonly onIssueFocus?: (sourceField: string) => void;
}

const valueToText = (value: PayloadValue): string => (Array.isArray(value) ? value.join('، ') : String(value ?? ''));

const extractReport = (details: unknown): BuildReport | null => {
  if (typeof details !== 'object' || details === null || !('errors' in details)) return null;
  return details as BuildReport;
};

/**
 * سربرگ آماری پیش‌نمایش Payload را می‌سازد.
 *
 * @param output - خروجی Build موفق.
 * @param size - حجم تقریبی Payload.
 * @returns ردیف Badge و metadata.
 */
function PreviewHeader({ output, size }: { readonly output: BuildOutput; readonly size: number }): JSX.Element {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge variant="success">{toPersianDigits(output.report.mappedFields.length)} فیلد ارسال می‌شود</Badge>
        <Badge variant="neutral">{toPersianDigits(output.report.omittedFields.length)} فیلد حذف شد</Badge>
        <Badge variant={output.report.warnings.length > 0 || output.report.unmappedFields.length > 0 ? 'warning' : 'info'}>
          {toPersianDigits(output.report.warnings.length + output.report.unmappedFields.length)} هشدار
        </Badge>
        <Badge variant="info">{toPersianDigits(size)} بایت</Badge>
      </div>
      <p className="text-xs leading-6 text-secondary">
        نسخه Mapping: {output.mappingVersion} · زمان ساخت: {formatJalaliDateTime(output.builtAt)}
      </p>
    </div>
  );
}

/**
 * جدول منشأ و مقدار نهایی فیلدهای Payload را نمایش می‌دهد.
 *
 * @param output - خروجی Build موفق.
 * @param payload - Payload قابل نمایش با mask اختیاری.
 * @returns جدول فیلدهای نگاشت‌شده.
 */
function PayloadFieldsTable({ output, payload }: { readonly output: BuildOutput; readonly payload: Payload }): JSX.Element {
  return (
    <TableContainer>
      <Table>
        <THead>
          <TR>
            <TH>کد مقصد</TH>
            <TH>برچسب فارسی</TH>
            <TH>فیلد منبع</TH>
            <TH>مقدار نهایی</TH>
            <TH>Transform</TH>
            <TH>منبع مقدار</TH>
          </TR>
        </THead>
        <TBody>
          {output.report.mappedFields.map((field, index) => (
            <TR key={`${field.code}-${field.sourceField}-${index}`}>
              <TD><code>{field.code}</code></TD>
              <TD>{field.labelFa}</TD>
              <TD><code>{field.sourceField}</code></TD>
              <TD><span className="block max-w-56 truncate" title={valueToText(payload.attrsList[field.attrsListIndex ?? 0]?.[field.code] ?? '')}>{valueToText(payload.attrsList[field.attrsListIndex ?? 0]?.[field.code] ?? '')}</span></TD>
              <TD><Badge variant="neutral">{field.transform}</Badge></TD>
              <TD>{field.source === 'attribute' ? 'Attribute' : 'پیش‌فرض'}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </TableContainer>
  );
}

/**
 * پیش‌نمایش زنده Payload را در تب‌های JSON، جدول، اعتبارسنجی و Diff نمایش می‌دهد.
 *
 * @param props - callback فوکوس روی فیلد خطادار.
 * @returns پنل کامل پیش‌نمایش Payload.
 */
export function PayloadPreview({ onIssueFocus }: PayloadPreviewProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<PreviewTab>('json');
  const [showSensitive, setShowSensitive] = useState(false);
  const [copyMode, setCopyMode] = useState<CopyPayloadMode>('pretty');
  const { result, isLoading } = usePayloadPreview();
  const previousPayload = useBuiltPayload();
  const { buildPayload } = usePayloadActions();

  const output = result?.ok === true ? result.data : null;
  const displayPayload = useMemo(
    () => (output === null ? null : formatPayloadForDisplay(output.payload, { maskSensitiveValues: !showSensitive, persianDigits: false })),
    [output, showSensitive],
  );
  const jsonText = useMemo(() => (displayPayload === null ? '' : JSON.stringify(displayPayload, null, 2)), [displayPayload]);
  const payloadSize = output === null ? 0 : estimatePayloadSize(output.payload);
  const errorReport = result?.ok === false ? extractReport(result.error.details) : null;
  const blockingErrors = output?.report.errors.length ?? errorReport?.errors.length ?? 0;

  if (isLoading) return <div className="rounded-xl border border-border bg-surface p-6 text-sm text-secondary">در حال ساخت پیش‌نمایش Payload...</div>;
  if (result === null) return <EmptyState icon={<AlertCircle className="size-6" />} title="Mapping فعال انتخاب نشده است" description="برای ساخت پیش‌نمایش، ابتدا Mapping فعال باید مشخص شود." />;
  if (!result.ok) {
    return (
      <div className="space-y-4">
        <ErrorAlert error={result.error} />
        {errorReport !== null ? <PayloadValidationResult report={errorReport} onIssueClick={(issue) => issue.sourceField !== undefined && onIssueFocus?.(issue.sourceField)} /> : null}
      </div>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <PreviewHeader output={result.data} size={payloadSize} />
        <div className="flex flex-wrap items-center gap-3">
          <Switch
            checked={showSensitive}
            label={showSensitive ? 'نمایش مقادیر حساس' : 'مقادیر حساس mask شده'}
            onClick={() => setShowSensitive((current) => !current)}
          />
          {displayPayload !== null ? <CopyPayloadButton payload={displayPayload} mode={copyMode} onModeChange={setCopyMode} /> : null}
        </div>
      </div>

      <Tabs
        value={activeTab}
        onChange={(value) => setActiveTab(value as PreviewTab)}
        items={[
          { value: 'json', label: 'JSON', content: <JsonCodeEditor value={jsonText} readOnly /> },
          { value: 'table', label: 'جدول', content: displayPayload === null ? null : <PayloadFieldsTable output={result.data} payload={displayPayload} /> },
          {
            value: 'validation',
            label: 'اعتبارسنجی',
            content: <PayloadValidationResult report={result.data.report} onIssueClick={(issue) => issue.sourceField !== undefined && onIssueFocus?.(issue.sourceField)} />,
          },
          { value: 'diff', label: 'Diff', content: <PayloadDiffViewer before={previousPayload} after={result.data.payload} /> },
        ]}
      />

      <div className="flex flex-wrap justify-end gap-2">
        <Tooltip content={blockingErrors > 0 ? 'تا رفع خطاهای مسدودکننده امکان ارسال وجود ندارد.' : 'Payload را دوباره می‌سازد و برای ارسال آماده می‌کند.'}>
          <Button type="button" disabled={blockingErrors > 0} leftIcon={showSensitive ? <Eye className="size-4" /> : <EyeOff className="size-4" />} rightIcon={<Send className="size-4" />} onClick={() => buildPayload()}>
            آماده‌سازی Payload
          </Button>
        </Tooltip>
        <SubmitTransactionButton />
      </div>
    </section>
  );
}
