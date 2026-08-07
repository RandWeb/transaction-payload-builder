/**
 * هدف فایل: ورود تراکنش از فایل، Drag & Drop یا paste با پیش‌نمایش قبل از اعمال.
 * جایگاه معماری: features/transactions/components و مرز UI برای import ساختار دقیق `docs/transaction.json`.
 */
import { useMemo, useState } from 'react';

import { appConfig } from '@/config/app-config';
import type { Mapping } from '@/features/mappings';
import type { Transaction, TransactionLeg } from '@/features/transactions';
import { ConfirmDialog, FileDropzone, JsonCodeEditor } from '@/shared/components';
import { Badge, Button, Select } from '@/shared/components/ui';
import { safeJsonParse, type JsonErrorPosition } from '@/shared/lib/json';
import { parseTransactionJson } from '../utils/transaction-normalizer';

type ImportMode = 'replace' | 'attributes';

interface ImportSummary {
  readonly legCount: number;
  readonly fieldCount: number;
  readonly valuedFieldCount: number;
  readonly unknownFields: readonly string[];
  readonly missingFields: readonly string[];
}

interface ImportCandidate {
  readonly transaction: Transaction;
  readonly summary: ImportSummary;
}

export interface TransactionJsonImportProps {
  readonly currentTransaction: Transaction;
  readonly activeMapping: Mapping | null;
  readonly isDirty: boolean;
  readonly onImport: (transaction: Transaction) => void;
}

const importModeOptions = [
  { value: 'replace', label: 'کل تراکنش' },
  { value: 'attributes', label: 'فقط attrsList' },
];

const allowedJsonTypes = new Set(['application/json', '']);

const isValidationIssue = (value: unknown): value is { readonly path: readonly (string | number)[]; readonly message: string } => {
  if (typeof value !== 'object' || value === null) return false;
  return 'path' in value && 'message' in value;
};

const formatIssuePath = (path: readonly (string | number)[]): string =>
  path.reduce<string>((currentPath, segment) => (typeof segment === 'number' ? `${currentPath}[${segment}]` : currentPath.length === 0 ? segment : `${currentPath}.${segment}`), '');

const hasValue = (value: TransactionLeg[string]): boolean => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

const summarizeTransaction = (transaction: Transaction, activeMapping: Mapping | null): ImportSummary => {
  const sourceFields = activeMapping === null ? [] : Object.values(activeMapping);
  const knownFields = new Set(sourceFields);
  const presentFields = new Set<string>();
  let fieldCount = 0;
  let valuedFieldCount = 0;

  for (const leg of transaction.mainTransaction.attrsList) {
    for (const [fieldName, fieldValue] of Object.entries(leg)) {
      fieldCount += 1;
      presentFields.add(fieldName);
      if (hasValue(fieldValue)) valuedFieldCount += 1;
    }
  }

  return {
    legCount: transaction.mainTransaction.attrsList.length,
    fieldCount,
    valuedFieldCount,
    unknownFields: sourceFields.length === 0 ? [] : [...presentFields].filter((fieldName) => !knownFields.has(fieldName)).sort(),
    missingFields: sourceFields.filter((fieldName) => !presentFields.has(fieldName)).sort(),
  };
};

const formatValidationDetails = (details: unknown): readonly string[] => {
  if (!Array.isArray(details)) return [];
  return details.filter(isValidationIssue).map((issue) => `${formatIssuePath(issue.path) || 'root'}: ${issue.message}`);
};

/**
 * ورودی JSON تراکنش را با کنترل فایل، parse، اعتبارسنجی و تایید جایگزینی مدیریت می‌کند.
 *
 * @param props - تراکنش فعلی، Mapping فعال، dirty state و callback اعمال import.
 * @returns پنل import تراکنش.
 */
export function TransactionJsonImport({ currentTransaction, activeMapping, isDirty, onImport }: TransactionJsonImportProps): JSX.Element {
  const [jsonText, setJsonText] = useState('');
  const [importMode, setImportMode] = useState<ImportMode>('replace');
  const [candidate, setCandidate] = useState<ImportCandidate | null>(null);
  const [pendingTransaction, setPendingTransaction] = useState<Transaction | null>(null);
  const [errors, setErrors] = useState<readonly string[]>([]);
  const [errorLine, setErrorLine] = useState<number | undefined>();

  const sizeLimitKb = useMemo(() => Math.floor(appConfig.maxUploadFileSizeBytes / 1024), []);

  const validateText = (text: string): void => {
    const parsedJson = safeJsonParse(text);
    if (!parsedJson.ok) {
      setCandidate(null);
      setErrorLine((parsedJson.error.details as JsonErrorPosition | null)?.line);
      setErrors([parsedJson.error.messageFa]);
      return;
    }

    const parsedTransaction = parseTransactionJson(parsedJson.data);
    if (!parsedTransaction.ok) {
      const detailErrors = formatValidationDetails(parsedTransaction.error.details);
      setCandidate(null);
      setErrorLine(undefined);
      setErrors([parsedTransaction.error.messageFa, ...detailErrors]);
      return;
    }

    setCandidate({ transaction: parsedTransaction.data, summary: summarizeTransaction(parsedTransaction.data, activeMapping) });
    setErrors([]);
    setErrorLine(undefined);
  };

  const handleFile = (file: File): void => {
    if (!file.name.toLowerCase().endsWith('.json') || !allowedJsonTypes.has(file.type)) {
      setErrors(['فقط فایل JSON با پسوند .json قابل ورود است.']);
      setCandidate(null);
      return;
    }

    if (file.size > appConfig.maxUploadFileSizeBytes) {
      setErrors([`حجم فایل نباید بیشتر از ${sizeLimitKb} کیلوبایت باشد.`]);
      setCandidate(null);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setErrors(['خواندن فایل JSON ناموفق بود.']);
      setCandidate(null);
    };
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setJsonText(text);
      validateText(text);
    };
    reader.readAsText(file);
  };

  const buildImportedTransaction = (transaction: Transaction): Transaction =>
    importMode === 'attributes'
      ? { mainTransaction: { ...currentTransaction.mainTransaction, attrsList: transaction.mainTransaction.attrsList } }
      : transaction;

  const requestApply = (): void => {
    if (candidate === null) {
      validateText(jsonText);
      return;
    }

    const importedTransaction = buildImportedTransaction(candidate.transaction);
    if (isDirty) {
      setPendingTransaction(importedTransaction);
      return;
    }

    onImport(importedTransaction);
  };

  const confirmApply = (): void => {
    if (pendingTransaction !== null) onImport(pendingTransaction);
    setPendingTransaction(null);
  };

  return (
    <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <div>
        <h2 className="text-lg font-semibold text-text">ورود transaction.json</h2>
        <p className="text-sm text-secondary">فقط ساختار دقیق `docs/transaction.json` شامل `mainTransaction.attrsList` پذیرفته می‌شود.</p>
      </div>

      <FileDropzone accept=".json,application/json" label={`فایل JSON را اینجا رها کنید یا انتخاب کنید؛ سقف ${sizeLimitKb} کیلوبایت`} onFileSelect={handleFile} />

      <Select label="نوع Import" options={importModeOptions} value={importMode} onChange={(event) => setImportMode(event.target.value as ImportMode)} />

      <JsonCodeEditor value={jsonText} onChange={setJsonText} errorLine={errorLine} />

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => validateText(jsonText)}>بررسی و پیش‌نمایش</Button>
        <Button type="button" onClick={requestApply} disabled={candidate === null}>اعمال Import</Button>
      </div>

      {errors.length > 0 ? (
        <div className="rounded-xl border border-error/30 bg-error/5 p-3 text-sm text-error">
          <p className="font-semibold">خطاهای Import</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {errors.map((error) => <li key={error}>{error}</li>)}
          </ul>
        </div>
      ) : null}

      {candidate !== null ? (
        <div className="space-y-2 rounded-xl border border-border bg-muted p-3 text-sm text-secondary">
          <div className="flex flex-wrap gap-2">
            <Badge>{candidate.summary.legCount} ردیف</Badge>
            <Badge>{candidate.summary.fieldCount} فیلد</Badge>
            <Badge variant="success">{candidate.summary.valuedFieldCount} مقدار‌دار</Badge>
          </div>
          <p>فیلدهای ناشناخته: {candidate.summary.unknownFields.length === 0 ? 'ندارد' : candidate.summary.unknownFields.slice(0, 8).join('، ')}</p>
          <p>فیلدهای گمشده Mapping: {candidate.summary.missingFields.length === 0 ? 'ندارد' : candidate.summary.missingFields.slice(0, 8).join('، ')}</p>
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={pendingTransaction !== null}
        title="جایگزینی پیش‌نویس فعلی"
        message="پیش‌نویس فعلی تغییر کرده است. آیا با Import، داده فعلی جایگزین شود؟"
        confirmLabel="جایگزین کن"
        onConfirm={confirmApply}
        onCancel={() => setPendingTransaction(null)}
      />
    </section>
  );
}
