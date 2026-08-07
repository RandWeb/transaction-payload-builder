/**
 * هدف فایل: صفحه کامل مدیریت Mapping خام مطابق `docs/mapping.json`.
 * جایگاه معماری: pages و مقصد مسیر `/mappings`.
 */
import { useEffect, useMemo, useState } from 'react';

import {
  createMappingRows,
  defaultMapping,
  MappingEditor,
  MappingImportDialog,
  MappingTable,
  MappingValidationPanel,
  MappingVersionList,
  useMappings,
  validateMappingAgainstTransaction,
  type Mapping,
  type MappingRow,
} from '@/features/mappings';
import { Button } from '@/shared/components/ui';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useDraftTransaction } from '@/stores/selectors';

export default function MappingsPage(): JSX.Element {
  useDocumentTitle('مدیریت کدینگ');
  const draftTransaction = useDraftTransaction();
  const mappings = useMappings();
  const [draftMapping, setDraftMapping] = useState<Mapping>(defaultMapping);
  const [editingRow, setEditingRow] = useState<MappingRow | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | undefined>();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | undefined>();
  const activeVersion = mappings.versions.find((version) => version.isActive)?.version ?? '1.0.0';

  useEffect(() => {
    if (mappings.activeMapping !== null) setDraftMapping(mappings.activeMapping);
  }, [mappings.activeMapping]);

  const rows = useMemo(() => createMappingRows(draftMapping), [draftMapping]);
  const issues = useMemo(
    () => validateMappingAgainstTransaction(draftMapping, draftTransaction),
    [draftMapping, draftTransaction],
  );

  const saveDraftAsPatch = async (): Promise<void> => {
    const error = await mappings.saveVersion(
      draftMapping,
      activeVersion.replace(/\.(\d+)$/, (_, patch: string) => `.${Number(patch) + 1}`),
      true,
    );
    setSaveError(error ?? undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">مدیریت کدینگ</h1>
          <p className="mt-1 text-sm text-secondary">
            فایل کدینگ دقیقاً به شکل خام `code -&gt; sourceField` مشابه `docs/mapping.json` نگه
            داشته می‌شود.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDraftMapping(mappings.activeMapping ?? defaultMapping)}
          >
            بازگشت به نسخه فعال
          </Button>
          <Button type="button" variant="outline" onClick={() => setIsImportOpen(true)}>
            Import mapping.json
          </Button>
          <Button
            type="button"
            onClick={() => {
              void saveDraftAsPatch();
            }}
          >
            ذخیره به‌عنوان نسخه جدید
          </Button>
        </div>
      </div>

      {mappings.error !== null ? (
        <p className="rounded-xl border border-error/30 bg-error/5 p-3 text-sm text-error">
          {mappings.error}
        </p>
      ) : null}
      {saveError !== undefined ? (
        <p className="rounded-xl border border-error/30 bg-error/5 p-3 text-sm text-error">
          {saveError}
        </p>
      ) : null}
      {mappings.isLoading ? (
        <p className="rounded-xl border border-border bg-surface p-4 text-sm text-secondary">
          در حال بارگذاری Mappingها...
        </p>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,0.8fr)]">
        <div className="space-y-4">
          <MappingTable rows={rows} selectedCode={selectedCode} onEdit={setEditingRow} />
        </div>
        <aside className="space-y-4">
          <MappingValidationPanel issues={issues} onSelectCode={setSelectedCode} />
          <MappingVersionList
            versions={mappings.versions}
            currentMapping={draftMapping}
            onActivate={mappings.activateVersion}
            onDelete={mappings.deleteVersion}
            getVersion={mappings.getVersion}
          />
        </aside>
      </div>

      <MappingEditor
        row={editingRow}
        mapping={draftMapping}
        transaction={draftTransaction}
        onSave={setDraftMapping}
        onClose={() => setEditingRow(null)}
      />
      <MappingImportDialog
        isOpen={isImportOpen}
        currentMapping={draftMapping}
        currentVersion={activeVersion}
        onImport={mappings.saveVersion}
        onClose={() => setIsImportOpen(false)}
      />
    </div>
  );
}
