/**
 * هدف فایل: دیالوگ انتخاب و بارگذاری قالب روی میز کار.
 * جایگاه معماری: features/templates/components و جریان Load از Template به Store.
 */
import { useMemo, useState } from 'react';

import type { Template } from '@/features/templates';
import { ConfirmDialog } from '@/shared/components';
import { Badge, Button, Dialog, Input } from '@/shared/components/ui';
import { toPersianDigits } from '@/shared/lib/format';
import { summarizeTemplate } from '../utils/template-summary';

export interface LoadTemplateDialogProps {
  readonly isOpen: boolean;
  readonly templates: readonly Template[];
  readonly isDirty: boolean;
  readonly onClose: () => void;
  readonly onLoad: (template: Template) => void;
}

/**
 * دیالوگ بارگذاری قالب را با جستجو و تأیید جایگزینی پیش‌نویس dirty نمایش می‌دهد.
 *
 * @param props - وضعیت دیالوگ، قالب‌ها و callback بارگذاری.
 * @returns دیالوگ انتخاب قالب.
 */
export function LoadTemplateDialog({ isOpen, templates, isDirty, onClose, onLoad }: LoadTemplateDialogProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [pendingTemplate, setPendingTemplate] = useState<Template | null>(null);
  const filteredTemplates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.length === 0) return templates;
    return templates.filter((template) => `${template.name} ${template.description ?? ''}`.toLowerCase().includes(normalizedQuery));
  }, [query, templates]);

  const requestLoad = (template: Template): void => {
    if (isDirty) {
      setPendingTemplate(template);
      return;
    }
    onLoad(template);
    onClose();
  };

  const confirmLoad = (): void => {
    if (pendingTemplate !== null) onLoad(pendingTemplate);
    setPendingTemplate(null);
    onClose();
  };

  return (
    <>
      <Dialog isOpen={isOpen} title="بارگذاری قالب" description="قالب را جستجو و با یک کلیک روی میز کار بارگذاری کنید." onClose={onClose} className="max-w-3xl">
        <div className="space-y-4">
          <Input label="جستجوی قالب" value={query} onChange={(event) => setQuery(event.target.value)} />
          <div className="grid max-h-[55dvh] gap-3 overflow-auto">
            {filteredTemplates.map((template) => {
              const summary = summarizeTemplate(template);
              return (
                <article key={template.id} className="rounded-xl border border-border bg-muted p-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-secondary">{template.description ?? 'بدون توضیح'}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge>{toPersianDigits(summary.fieldCount)} فیلد</Badge>
                        <Badge variant="info">مبلغ: {toPersianDigits(summary.amount)}</Badge>
                        <Badge variant="neutral">نوع: {summary.transactionType}</Badge>
                      </div>
                    </div>
                    <Button type="button" onClick={() => requestLoad(template)}>بارگذاری</Button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </Dialog>
      <ConfirmDialog
        isOpen={pendingTemplate !== null}
        title="جایگزینی پیش‌نویس فعلی"
        message="پیش‌نویس فعلی تغییر کرده است. آیا با بارگذاری قالب، داده فعلی جایگزین شود؟"
        confirmLabel="جایگزین کن"
        cancelLabel="انصراف"
        onConfirm={confirmLoad}
        onCancel={() => setPendingTemplate(null)}
      />
    </>
  );
}
