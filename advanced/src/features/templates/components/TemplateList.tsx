/**
 * هدف فایل: صفحه مدیریت قالب‌ها با جدول، کارت، CRUD و Import/Export JSON.
 * جایگاه معماری: features/templates/components و Container اصلی `/templates`.
 */
import { useRef, useState } from 'react';

import type { Template } from '@/features/templates';
import { ConfirmDialog, CopyButton, EmptyState } from '@/shared/components';
import { Badge, Button, Table, TableContainer, TBody, TD, TH, THead, TR } from '@/shared/components/ui';
import { useToast } from '@/shared/hooks/useToast';
import { downloadJson } from '@/shared/lib/json';
import { formatJalaliDateTime, toPersianDigits } from '@/shared/lib/format';
import { useDraftTransaction, useTransactionActions, useWorkspaceDirtyState } from '@/stores';
import { exportTemplateToJson, parseTemplateJson } from '../api/templates-api';
import { useTemplates } from '../hooks/useTemplates';
import { summarizeTemplate } from '../utils/template-summary';
import { LoadTemplateDialog } from './LoadTemplateDialog';
import { SaveTemplateDialog } from './SaveTemplateDialog';
import { TemplateActionButton, TemplateCard } from './TemplateCard';

/**
 * نمای کامل مدیریت قالب‌ها را برای صفحه `/templates` فراهم می‌کند.
 *
 * @returns لیست، اکشن‌ها و دیالوگ‌های مدیریت قالب.
 */
export function TemplateList(): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isLoadOpen, setIsLoadOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);
  const draftTransaction = useDraftTransaction();
  const dirtyState = useWorkspaceDirtyState();
  const { loadFromTemplate } = useTransactionActions();
  const { showToast } = useToast();
  const templatesState = useTemplates();
  const templates = templatesState.templates;

  const createTemplate = async (input: Parameters<typeof templatesState.createTemplate>[0]): Promise<void> => {
    const result = await templatesState.createTemplate(input);
    showToast({ type: result.ok ? 'success' : 'error', message: result.ok ? 'قالب ذخیره شد.' : result.error.messageFa });
  };

  const updateTemplate = async (template: Template): Promise<void> => {
    const result = await templatesState.updateTemplate(template);
    showToast({ type: result.ok ? 'success' : 'error', message: result.ok ? 'قالب بروزرسانی شد.' : result.error.messageFa });
  };

  const removeTemplate = async (): Promise<void> => {
    if (deletingTemplate === null) return;
    const result = await templatesState.removeTemplate(deletingTemplate.id);
    showToast({ type: result.ok ? 'success' : 'error', message: result.ok ? 'قالب حذف شد.' : result.error.messageFa });
    setDeletingTemplate(null);
  };

  const duplicateTemplate = async (template: Template): Promise<void> => {
    const result = await templatesState.duplicateTemplate(template.id);
    showToast({ type: result.ok ? 'success' : 'error', message: result.ok ? 'قالب کپی شد.' : result.error.messageFa });
  };

  const nameExists = async (name: string): Promise<boolean> => {
    const result = await templatesState.templateNameExists(name);
    return result.ok ? result.data : false;
  };

  const exportTemplate = (template: Template): void => {
    downloadJson(exportTemplateToJson(template), `template-${template.name.replace(/[^\w-]+/g, '-') || template.id}.json`);
  };

  const importTemplateFile = (file: File): void => {
    const reader = new FileReader();
    reader.onerror = () => showToast({ type: 'error', message: 'خواندن فایل قالب ناموفق بود.' });
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const parsedTemplate = parseTemplateJson(text);
      if (!parsedTemplate.ok) {
        showToast({ type: 'error', message: parsedTemplate.error.messageFa });
        return;
      }
      void createTemplate({
        name: parsedTemplate.data.name,
        description: parsedTemplate.data.description,
        transaction: parsedTemplate.data.transaction,
      });
    };
    reader.readAsText(file);
  };

  const actions = (template: Template): JSX.Element => (
    <>
      <TemplateActionButton onClick={() => { loadFromTemplate(template); showToast({ type: 'success', message: 'قالب در میز کار بارگذاری شد.' }); }}>بارگذاری</TemplateActionButton>
      <TemplateActionButton onClick={() => { setEditingTemplate(template); setIsSaveOpen(true); }}>ویرایش</TemplateActionButton>
      <TemplateActionButton onClick={() => { void duplicateTemplate(template); }}>کپی</TemplateActionButton>
      <TemplateActionButton onClick={() => exportTemplate(template)}>Export</TemplateActionButton>
      <CopyButton text={exportTemplateToJson(template)} label="کپی JSON" />
      <TemplateActionButton variant="danger" onClick={() => setDeletingTemplate(template)}>حذف</TemplateActionButton>
    </>
  );

  if (templatesState.templatesQuery.isLoading) return <p className="text-sm text-secondary">در حال خواندن قالب‌ها...</p>;
  if (templatesState.templatesQuery.data !== undefined && !templatesState.templatesQuery.data.ok) return <EmptyState title="خواندن قالب‌ها ناموفق بود" description={templatesState.templatesQuery.data.error.messageFa} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => { setEditingTemplate(null); setIsSaveOpen(true); }}>ساخت اولین قالب / ذخیره فعلی</Button>
        <Button type="button" variant="outline" onClick={() => setIsLoadOpen(true)} disabled={templates.length === 0}>بارگذاری قالب</Button>
        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>Import JSON</Button>
        <input ref={fileInputRef} className="sr-only" type="file" accept=".json,application/json" onChange={(event) => {
          const file = event.target.files?.item(0);
          if (file !== null && file !== undefined) importTemplateFile(file);
          event.currentTarget.value = '';
        }} />
      </div>

      {templates.length === 0 ? <EmptyState title="قالبی وجود ندارد" action={<Button type="button" onClick={() => setIsSaveOpen(true)}>ساخت اولین قالب</Button>} /> : null}

      <div className="grid gap-3 md:hidden">
        {templates.map((template) => <TemplateCard key={template.id} template={template} summary={summarizeTemplate(template)} actions={actions(template)} />)}
      </div>

      <TableContainer className="hidden md:block">
        <Table>
          <THead>
            <TR>
              <TH>نام</TH>
              <TH>توضیح</TH>
              <TH>خلاصه</TH>
              <TH>ایجاد/بروزرسانی</TH>
              <TH>عملیات</TH>
            </TR>
          </THead>
          <TBody>
            {templates.map((template) => {
              const summary = summarizeTemplate(template);
              return (
                <TR key={template.id}>
                  <TD>{template.name}</TD>
                  <TD>{template.description ?? '—'}</TD>
                  <TD><div className="flex flex-wrap gap-2"><Badge>{toPersianDigits(summary.fieldCount)} فیلد</Badge><Badge variant="info">{toPersianDigits(summary.amount)}</Badge><Badge variant="neutral">{summary.transactionType}</Badge></div></TD>
                  <TD><span className="block text-xs text-secondary">ایجاد: {formatJalaliDateTime(template.createdAt)}</span><span className="block text-xs text-secondary">بروزرسانی: {formatJalaliDateTime(template.updatedAt)}</span></TD>
                  <TD><div className="flex flex-wrap gap-2">{actions(template)}</div></TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </TableContainer>

      <SaveTemplateDialog
        isOpen={isSaveOpen}
        transaction={draftTransaction}
        templates={templates}
        editingTemplate={editingTemplate}
        nameExists={nameExists}
        onCreate={createTemplate}
        onUpdate={updateTemplate}
        onClose={() => { setIsSaveOpen(false); setEditingTemplate(null); }}
      />
      <LoadTemplateDialog isOpen={isLoadOpen} templates={templates} isDirty={dirtyState.isDirty} onLoad={loadFromTemplate} onClose={() => setIsLoadOpen(false)} />
      <ConfirmDialog
        isOpen={deletingTemplate !== null}
        title="حذف قالب"
        message="این قالب برای همیشه حذف می‌شود و قابل بازگشت نیست."
        confirmLabel="حذف"
        cancelLabel="انصراف"
        onConfirm={() => { void removeTemplate(); }}
        onCancel={() => setDeletingTemplate(null)}
      />
    </div>
  );
}
