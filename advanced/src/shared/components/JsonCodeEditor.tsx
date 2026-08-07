/**
 * هدف فایل: ادیتور JSON ساده با شماره خط، Format و حالت فقط‌خواندنی.
 * جایگاه معماری: shared/components بدون وابستگی خارجی برای ورودی/خروجی JSON.
 */
import { useMemo } from 'react';

import { Button } from '@/shared/components/ui/Button';
import { Textarea } from '@/shared/components/ui/Textarea';

export interface JsonCodeEditorProps {
  readonly value: string;
  readonly onChange?: (value: string) => void;
  readonly readOnly?: boolean;
  readonly errorLine?: number;
}

/**
 * JSON را با textarea و ستون شماره خط نمایش/ویرایش می‌کند.
 *
 * @param props - مقدار JSON، callback تغییر و حالت فقط‌خواندنی.
 * @returns ادیتور ساده JSON بدون کتابخانه خارجی.
 * @example
 * <JsonCodeEditor value={json} onChange={setJson} />
 */
export function JsonCodeEditor({ value, onChange, readOnly = false, errorLine }: JsonCodeEditorProps): JSX.Element {
  const lineNumbers = useMemo(() => value.split('\n').map((_, index) => index + 1), [value]);

  const formatJson = (): void => {
    if (onChange === undefined) return;
    const parsedValue = JSON.parse(value) as unknown;
    onChange(JSON.stringify(parsedValue, null, 2));
  };

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="flex justify-end border-b border-border p-2">
        {!readOnly ? <Button type="button" variant="ghost" size="sm" onClick={formatJson}>فرمت JSON</Button> : null}
      </div>
      <div className="grid grid-cols-[3rem_1fr] overflow-hidden">
        <pre className="select-none bg-muted p-3 text-end text-xs leading-6 text-secondary" aria-hidden="true">
          {lineNumbers.map((lineNumber) => (
            <span key={lineNumber} className={lineNumber === errorLine ? 'block text-error' : 'block'}>{lineNumber}</span>
          ))}
        </pre>
        <Textarea
          aria-label="ویرایشگر JSON"
          className="min-h-64 rounded-none border-0 font-mono text-sm leading-6"
          dir="ltr"
          value={value}
          readOnly={readOnly}
          onChange={(event) => onChange?.(event.target.value)}
        />
      </div>
    </div>
  );
}
