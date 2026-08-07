/**
 * هدف فایل: ورود فایل mapping.json خام با Diff و ساخت نسخه جدید.
 * جایگاه معماری: features/mappings/components و جریان امن Import Mapping.
 */
import { useMemo, useState } from 'react';

import { appConfig } from '@/config/app-config';
import type { Mapping } from '@/features/mappings';
import { ConfirmDialog, FileDropzone, JsonCodeEditor } from '@/shared/components';
import { Button, Dialog, Input } from '@/shared/components/ui';
import { safeJsonParse } from '@/shared/lib/json';
import { mappingSchema } from '../schemas/mapping.schema';
import { diffMappings, suggestNextVersion, type MappingDiff } from '../utils/mapping-manager';
import { MappingDiffViewer } from './MappingDiffViewer';

export interface MappingImportDialogProps {
  readonly isOpen: boolean;
  readonly currentMapping: Mapping;
  readonly currentVersion: string;
  readonly onImport: (mapping: Mapping, version: string, activate: boolean) => Promise<string | null>;
  readonly onClose: () => void;
}

const emptyDiff: MappingDiff = { added: [], removed: [], changed: [] };

/**
 * Dialog Import را با parse امن، schema خام و تایید ذخیره نسخه نمایش می‌دهد.
 *
 * @param props - وضعیت باز بودن، Mapping فعلی، نسخه فعلی و callback ذخیره.
 * @returns Dialog ورود Mapping.
 */
export function MappingImportDialog({ isOpen, currentMapping, currentVersion, onImport, onClose }: MappingImportDialogProps): JSX.Element {
  const [jsonText, setJsonText] = useState('');
  const [candidate, setCandidate] = useState<Mapping | null>(null);
  const [version, setVersion] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [shouldActivate, setShouldActivate] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const sizeLimitKb = Math.floor(appConfig.maxUploadFileSizeBytes / 1024);
  const diff = useMemo(() => (candidate === null ? emptyDiff : diffMappings(currentMapping, candidate)), [candidate, currentMapping]);

  const validateText = (text: string): void => {
    const parsedJson = safeJsonParse(text);
    if (!parsedJson.ok) {
      setError(parsedJson.error.messageFa);
      setCandidate(null);
      return;
    }
    const parsedMapping = mappingSchema.safeParse(parsedJson.data);
    if (!parsedMapping.success) {
      setError(parsedMapping.error.issues[0]?.message ?? 'ساختار Mapping باید دقیقاً مشابه docs/mapping.json باشد.');
      setCandidate(null);
      return;
    }
    const nextDiff = diffMappings(currentMapping, parsedMapping.data);
    setCandidate(parsedMapping.data);
    setVersion(suggestNextVersion(currentVersion, nextDiff));
    setError(undefined);
  };

  const readFile = (file: File): void => {
    if (!file.name.toLowerCase().endsWith('.json')) {
      setError('فقط فایل JSON با پسوند .json قابل ورود است.');
      return;
    }
    if (file.size > appConfig.maxUploadFileSizeBytes) {
      setError(`حجم فایل نباید بیشتر از ${sizeLimitKb} کیلوبایت باشد.`);
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setError('خواندن فایل Mapping ناموفق بود.');
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setJsonText(text);
      validateText(text);
    };
    reader.readAsText(file);
  };

  const save = async (): Promise<void> => {
    if (candidate === null) return;
    setIsSaving(true);
    const saveError = await onImport(candidate, version, shouldActivate);
    setIsSaving(false);
    if (saveError !== null) {
      setError(saveError);
      return;
    }
    setJsonText('');
    setCandidate(null);
    setVersion('');
    setIsConfirmOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog isOpen={isOpen} title="Import mapping.json" onClose={onClose} className="max-w-4xl">
        <div className="space-y-4">
          <FileDropzone accept=".json,application/json" label={`mapping.json خام را انتخاب کنید؛ سقف ${sizeLimitKb} کیلوبایت`} onFileSelect={readFile} />
          <JsonCodeEditor value={jsonText} onChange={setJsonText} />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => validateText(jsonText)}>بررسی Diff</Button>
            <Button type="button" disabled={candidate === null} onClick={() => setIsConfirmOpen(true)}>ذخیره نسخه</Button>
          </div>
          {error !== undefined ? <p className="rounded-xl border border-error/30 bg-error/5 p-3 text-sm text-error">{error}</p> : null}
          {candidate !== null ? (
            <div className="space-y-3">
              <MappingDiffViewer diff={diff} />
              <Input label="نسخه جدید Semver" value={version} onChange={(event) => setVersion(event.target.value)} />
              <label className="flex items-center gap-2 text-sm text-text">
                <input type="checkbox" checked={shouldActivate} onChange={(event) => setShouldActivate(event.target.checked)} />
                فعال‌سازی بلافاصله بعد از ذخیره
              </label>
            </div>
          ) : null}
        </div>
      </Dialog>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="ذخیره نسخه Mapping"
        message="نسخه جدید ذخیره می‌شود و در صورت انتخاب، Mapping فعال Workspace را تغییر می‌دهد."
        confirmLabel={isSaving ? 'در حال ذخیره...' : 'ذخیره'}
        onConfirm={() => { void save(); }}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
