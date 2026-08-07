/**
 * هدف فایل: ویرایش یک ردیف Mapping خام در Dialog بدون افزودن metadata به فایل Mapping.
 * جایگاه معماری: features/mappings/components و فرم ویرایش ردیف.
 */
import { useMemo, useState } from 'react';

import type { Mapping } from '@/features/mappings';
import type { Transaction } from '@/features/transactions';
import { Button, Dialog, Input, Select } from '@/shared/components/ui';
import { mappingSchema } from '../schemas/mapping.schema';
import type { MappingRow } from '../utils/mapping-manager';
import { getTargetCodes, updateMappingEntry } from '../utils/mapping-manager';

export interface MappingEditorProps {
  readonly row: MappingRow | null;
  readonly mapping: Mapping;
  readonly transaction: Transaction;
  readonly onSave: (mapping: Mapping) => void;
  readonly onClose: () => void;
}

/**
 * Dialog ویرایش Mapping را با کدهای آزاد و autocomplete از Attributeهای تراکنش فعلی نمایش می‌دهد.
 *
 * @param props - ردیف در حال ویرایش، Mapping فعلی، تراکنش و callback ذخیره.
 * @returns Dialog ویرایش یا null در حالت بسته.
 */
export function MappingEditor({ row, mapping, transaction, onSave, onClose }: MappingEditorProps): JSX.Element | null {
  const [code, setCode] = useState(row?.code ?? '');
  const [sourceField, setSourceField] = useState(row?.sourceField ?? '');
  const [error, setError] = useState<string | undefined>();
  const transactionFields = useMemo(
    () => [...new Set(transaction.mainTransaction.attrsList.flatMap((leg) => Object.keys(leg)))].sort(),
    [transaction.mainTransaction.attrsList],
  );
  const codeOptions = useMemo(
    () => getTargetCodes().map((targetCode) => ({ value: targetCode, label: targetCode, disabled: targetCode !== row?.code && mapping[targetCode] !== undefined })),
    [mapping, row?.code],
  );
  const sampleValue = transaction.mainTransaction.attrsList.find((leg) => sourceField in leg)?.[sourceField];

  if (row === null) return null;

  const submit = (): void => {
    const nextMapping = updateMappingEntry(mapping, row.code, code, sourceField);
    const parsed = mappingSchema.safeParse(nextMapping);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Mapping معتبر نیست.');
      return;
    }
    onSave(parsed.data);
    onClose();
  };

  return (
    <Dialog
      isOpen={row !== null}
      title={`ویرایش Mapping کد ${row.code}`}
      onClose={onClose}
      className="max-w-2xl"
      footer={<><Button type="button" variant="ghost" onClick={onClose}>لغو</Button><Button type="button" onClick={submit}>ذخیره</Button></>}
    >
      <div className="space-y-4">
        <Select label="کد مقصد" options={codeOptions} value={code} onChange={(event) => setCode(event.target.value)} />
        <Input label="sourceField" list="mapping-source-fields" value={sourceField} onChange={(event) => setSourceField(event.target.value)} error={error} />
        <datalist id="mapping-source-fields">
          {transactionFields.map((fieldName) => <option key={fieldName} value={fieldName} />)}
        </datalist>
        <div className="rounded-xl border border-border bg-muted p-3 text-sm text-secondary">
          <p>Transform پیشنهادی: <span className="font-mono">{row.transform}</span></p>
          <p>پیش‌نمایش مقدار نمونه: <span className="font-mono" dir="ltr">{sampleValue === undefined ? '—' : JSON.stringify(sampleValue)}</span></p>
          <p>Required: {row.required ? 'بله' : 'خیر'} · DefaultValue: رشته خالی طبق قرارداد Q5</p>
        </div>
      </div>
    </Dialog>
  );
}
