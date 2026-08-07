/**
 * هدف فایل: نمایش نسخه‌های Mapping، فعال‌سازی، حذف امن و Diff بین نسخه‌ها.
 * جایگاه معماری: features/mappings/components و مدیریت نسخه‌ها.
 */
import { useState } from 'react';

import type { Mapping } from '@/features/mappings';
import { ConfirmDialog } from '@/shared/components';
import { Badge, Button, Select } from '@/shared/components/ui';
import type { MappingVersionSummary } from '@/shared/db';
import { formatJalaliDateTime } from '@/shared/lib/format';
import { diffMappings, type MappingDiff } from '../utils/mapping-manager';
import { MappingDiffViewer } from './MappingDiffViewer';

export interface MappingVersionListProps {
  readonly versions: readonly MappingVersionSummary[];
  readonly currentMapping: Mapping;
  readonly onActivate: (version: string) => Promise<string | null>;
  readonly onDelete: (version: string) => Promise<string | null>;
  readonly getVersion: (version: string) => Promise<Mapping | string | null>;
}

const emptyDiff: MappingDiff = { added: [], removed: [], changed: [] };

/**
 * نسخه‌های Mapping را با ConfirmDialog برای تغییر نسخه فعال نمایش می‌دهد.
 *
 * @param props - نسخه‌ها و عملیات فعال‌سازی/حذف/خواندن نسخه.
 * @returns پنل نسخه‌های Mapping.
 */
export function MappingVersionList({ versions, currentMapping, onActivate, onDelete, getVersion }: MappingVersionListProps): JSX.Element {
  const [pendingAction, setPendingAction] = useState<{ readonly type: 'activate' | 'delete'; readonly version: string } | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [diffVersion, setDiffVersion] = useState('');
  const [diff, setDiff] = useState<MappingDiff>(emptyDiff);

  const runPendingAction = async (): Promise<void> => {
    if (pendingAction === null) return;
    const actionError = pendingAction.type === 'activate' ? await onActivate(pendingAction.version) : await onDelete(pendingAction.version);
    setPendingAction(null);
    if (actionError !== null) setError(actionError);
  };

  const showDiff = async (version: string): Promise<void> => {
    setDiffVersion(version);
    const mapping = await getVersion(version);
    if (typeof mapping === 'string') {
      setError(mapping);
      return;
    }
    setDiff(mapping === null ? emptyDiff : diffMappings(currentMapping, mapping));
  };

  return (
    <section className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <h2 className="text-lg font-semibold text-text">نسخه‌های Mapping</h2>
      {error !== undefined ? <p className="rounded-xl border border-error/30 bg-error/5 p-3 text-sm text-error">{error}</p> : null}
      <div className="space-y-2">
        {versions.map((version) => (
          <div key={version.version} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3">
            <div>
              <p className="font-mono text-sm text-text">{version.version}</p>
              <p className="text-xs text-secondary">{formatJalaliDateTime(version.createdAt)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {version.isActive ? <Badge variant="success">فعال</Badge> : null}
              <Button type="button" size="sm" variant="outline" onClick={() => { void showDiff(version.version); }}>Diff</Button>
              <Button type="button" size="sm" variant="outline" disabled={version.isActive} onClick={() => setPendingAction({ type: 'activate', version: version.version })}>فعال‌سازی</Button>
              <Button type="button" size="sm" variant="danger" disabled={version.isActive} onClick={() => setPendingAction({ type: 'delete', version: version.version })}>حذف</Button>
            </div>
          </div>
        ))}
      </div>
      <Select
        label="مشاهده Diff با نسخه"
        placeholder="یک نسخه را انتخاب کنید"
        options={versions.map((version) => ({ value: version.version, label: version.version }))}
        value={diffVersion}
        onChange={(event) => { void showDiff(event.target.value); }}
      />
      {diffVersion.length > 0 ? <MappingDiffViewer diff={diff} /> : null}
      <ConfirmDialog
        isOpen={pendingAction !== null}
        title={pendingAction?.type === 'activate' ? 'فعال‌سازی Mapping' : 'حذف Mapping'}
        message={pendingAction?.type === 'activate' ? 'تغییر Mapping فعال روی Payloadهای بعدی اثر می‌گذارد.' : 'حذف نسخه‌ای که در Audit استفاده شده باشد توسط Repository مسدود می‌شود.'}
        confirmLabel="تأیید"
        onConfirm={() => { void runPendingAction(); }}
        onCancel={() => setPendingAction(null)}
      />
    </section>
  );
}
