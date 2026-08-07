/**
 * هدف فایل: دیالوگ ذخیره Snapshot فعلی تراکنش به‌عنوان قالب.
 * جایگاه معماری: features/templates/components و فرم create/update قالب.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { Template } from '@/features/templates';
import { ConfirmDialog } from '@/shared/components';
import { Button, Dialog, Input, Textarea } from '@/shared/components/ui';
import type { Transaction } from '@/features/transactions';

const saveTemplateFormSchema = z.object({
  name: z.string().min(1, 'نام قالب الزامی است.').max(80, 'نام قالب بیش از حد طولانی است.'),
  description: z.string().max(500, 'توضیح قالب بیش از حد طولانی است.').optional(),
});

type SaveTemplateForm = z.infer<typeof saveTemplateFormSchema>;

export interface SaveTemplateDialogProps {
  readonly isOpen: boolean;
  readonly transaction: Transaction;
  readonly templates: readonly Template[];
  readonly editingTemplate?: Template | null;
  readonly onClose: () => void;
  readonly onCreate: (input: { readonly name: string; readonly description?: string; readonly transaction: Transaction }) => Promise<void>;
  readonly onUpdate: (template: Template) => Promise<void>;
  readonly nameExists: (name: string) => Promise<boolean>;
}

/**
 * دیالوگ ذخیره قالب را با بررسی زنده نام تکراری و مسیر update نمایش می‌دهد.
 *
 * @param props - وضعیت دیالوگ، تراکنش فعلی و callbackهای ذخیره.
 * @returns دیالوگ فرم ذخیره قالب.
 */
export function SaveTemplateDialog({ isOpen, transaction, templates, editingTemplate = null, onClose, onCreate, onUpdate, nameExists }: SaveTemplateDialogProps): JSX.Element {
  const [duplicateTemplate, setDuplicateTemplate] = useState<Template | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const form = useForm<SaveTemplateForm>({
    resolver: zodResolver(saveTemplateFormSchema),
    defaultValues: { name: editingTemplate?.name ?? '', description: editingTemplate?.description ?? '' },
  });
  const watchedName = form.watch('name');

  useEffect(() => {
    if (!isOpen) return;
    form.reset({ name: editingTemplate?.name ?? '', description: editingTemplate?.description ?? '' });
    setDuplicateTemplate(null);
  }, [editingTemplate, form, isOpen]);

  useEffect(() => {
    const normalizedName = watchedName.trim();
    if (!isOpen || normalizedName.length === 0 || normalizedName === editingTemplate?.name) {
      setDuplicateTemplate(null);
      return undefined;
    }

    setIsCheckingName(true);
    const timeoutId = window.setTimeout(() => {
      void nameExists(normalizedName).then((exists) => {
        setDuplicateTemplate(exists ? templates.find((template) => template.name === normalizedName) ?? null : null);
        setIsCheckingName(false);
      });
    }, 350);
    return () => {
      window.clearTimeout(timeoutId);
      setIsCheckingName(false);
    };
  }, [editingTemplate?.name, isOpen, nameExists, templates, watchedName]);

  const save = async (values: SaveTemplateForm): Promise<void> => {
    if (duplicateTemplate !== null && editingTemplate === null) return;
    setIsSaving(true);
    if (editingTemplate === null) {
      await onCreate({ ...values, transaction });
    } else {
      await onUpdate({ ...editingTemplate, ...values, transaction });
    }
    setIsSaving(false);
    onClose();
  };

  const updateDuplicate = async (): Promise<void> => {
    const values = form.getValues();
    if (duplicateTemplate === null) return;
    setIsSaving(true);
    await onUpdate({ ...duplicateTemplate, description: values.description, transaction });
    setIsSaving(false);
    setDuplicateTemplate(null);
    onClose();
  };

  return (
    <>
      <Dialog
        isOpen={isOpen}
        title={editingTemplate === null ? 'ذخیره قالب' : 'ویرایش قالب'}
        description="نام قالب باید یکتا باشد و Snapshot کامل تراکنش فعلی ذخیره می‌شود."
        onClose={onClose}
        footer={(
          <>
            <Button type="button" variant="ghost" onClick={onClose}>انصراف</Button>
            <Button type="submit" form="save-template-form" isLoading={isSaving} disabled={duplicateTemplate !== null && editingTemplate === null}>ذخیره</Button>
          </>
        )}
      >
        <form id="save-template-form" className="space-y-4" onSubmit={(event) => { void form.handleSubmit(save)(event); }}>
          <Input label="نام قالب" required error={form.formState.errors.name?.message ?? (duplicateTemplate === null ? undefined : 'نام قالب تکراری است.')} hint={isCheckingName ? 'در حال بررسی یکتایی نام...' : undefined} {...form.register('name')} />
          <Textarea label="توضیح" maxLength={500} showCount error={form.formState.errors.description?.message} {...form.register('description')} />
          <p className="text-xs text-secondary">تعداد ردیف‌ها: {transaction.mainTransaction.attrsList.length} · شناسه: {transaction.mainTransaction.fraudMessageId}</p>
        </form>
      </Dialog>
      <ConfirmDialog
        isOpen={duplicateTemplate !== null && editingTemplate === null}
        title="نام قالب تکراری است"
        message="قالبی با این نام وجود دارد. آیا قالب موجود با Snapshot فعلی بروزرسانی شود؟"
        confirmLabel="بروزرسانی قالب موجود"
        cancelLabel="تغییر نام"
        onConfirm={() => { void updateDuplicate(); }}
        onCancel={() => setDuplicateTemplate(null)}
      />
    </>
  );
}
