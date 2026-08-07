/**
 * هدف فایل: چیدمان اختصاصی میز کار با ویرایشگر تراکنش و جایگاه Preview.
 * جایگاه معماری: app/layouts برای صفحه `/workspace`.
 */
import { useEffect, useState } from 'react';

import { defaultMapping } from '@/features/mappings';
import { PayloadPreview } from '@/features/payload';
import { Button } from '@/shared/components/ui/Button';
import { Tabs } from '@/shared/components/ui/Tabs';
import { useActiveMapping, usePayloadActions } from '@/stores';
import { TransactionEditor } from '../../features/transactions/components/TransactionEditor';

/**
 * Layout میز کار را با ویرایشگر تراکنش و تب موبایل نمایش می‌دهد.
 *
 * @returns چیدمان responsive Workspace.
 */
export function WorkspaceLayout(): JSX.Element {
  const [activeTab, setActiveTab] = useState('editor');
  const activeMapping = useActiveMapping();
  const { buildPayload, setActiveMapping } = usePayloadActions();

  useEffect(() => {
    if (activeMapping === null) setActiveMapping(defaultMapping);
  }, [activeMapping, setActiveMapping]);

  const editor = <TransactionEditor />;
  const preview = <PayloadPreview onIssueFocus={() => setActiveTab('editor')} />;

  return (
    <div className="space-y-4">
      <div className="hidden gap-4 xl:grid xl:grid-cols-[minmax(0,1.6fr)_minmax(22rem,0.8fr)]">
        {editor}
        {preview}
      </div>
      <div className="xl:hidden">
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          items={[
            { value: 'editor', label: 'ویرایش', content: editor },
            { value: 'preview', label: 'پیش‌نمایش', content: preview },
          ]}
        />
      </div>
      <div className="sticky bottom-3 flex gap-2 rounded-xl border border-border bg-surface p-3 shadow-[var(--shadow-card)] xl:hidden">
        <Button type="button" variant="outline" onClick={() => setActiveTab('editor')}>ویرایش</Button>
        <Button type="button" onClick={() => buildPayload()}>ساخت Payload</Button>
      </div>
    </div>
  );
}
