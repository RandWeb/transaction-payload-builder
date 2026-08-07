/**
 * هدف فایل: فرم افزودن یا ویرایش یک Attribute در ردیف انتخاب‌شده `attrsList`.
 * جایگاه معماری: features/transactions/components و ورودی پویا برای فیلدهای تراکنش.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { Mapping } from '@/features/mappings';
import type { TransactionLeg } from '@/features/transactions';
import { Button, Input, Select, Textarea } from '@/shared/components/ui';
import {
  detectAttributeValueType,
  findTargetCode,
  getMappingSourceFields,
  normalizeAttributeValue,
  type TransactionAttributeValueType,
} from '../utils/transaction-normalizer';

const attributeTypeOptions: readonly { readonly value: TransactionAttributeValueType; readonly label: string }[] = [
  { value: 'string', label: 'متن' },
  { value: 'number', label: 'عدد' },
  { value: 'boolean', label: 'بولی' },
  { value: 'date', label: 'تاریخ' },
  { value: 'list', label: 'لیست' },
];

const attributeFormSchema = z.object({
  name: z.string().min(1, 'نام Attribute الزامی است.'),
  type: z.enum(['string', 'number', 'boolean', 'date', 'list']),
  value: z.string(),
});

type AttributeFormValues = z.infer<typeof attributeFormSchema>;

export interface TransactionAttributeFormProps {
  readonly leg: TransactionLeg;
  readonly activeMapping: Mapping | null;
  readonly editingName?: string;
  readonly onSubmit: (name: string, type: TransactionAttributeValueType, value: string, previousName?: string) => void;
  readonly onCancelEdit?: () => void;
}

/**
 * فرم Attribute را با autocomplete از Mapping خام فعال نمایش می‌دهد.
 *
 * @param props - ردیف تراکنش، Mapping فعال و callback ثبت.
 * @returns فرم افزودن/ویرایش Attribute.
 */
export function TransactionAttributeForm({ leg, activeMapping, editingName, onSubmit, onCancelEdit }: TransactionAttributeFormProps): JSX.Element {
  const editingValue = editingName === undefined ? undefined : leg[editingName];
  const form = useForm<AttributeFormValues>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: zodResolver(attributeFormSchema),
    values: {
      name: editingName ?? '',
      type: editingValue === undefined ? 'string' : detectAttributeValueType(editingValue),
      value: Array.isArray(editingValue) ? editingValue.join(', ') : String(editingValue ?? ''),
    },
  });
  const watchedName = form.watch('name');
  const watchedType = form.watch('type');
  const sourceFields = getMappingSourceFields(activeMapping);
  const targetCode = findTargetCode(activeMapping, watchedName);
  const isUnmapped = watchedName.trim().length > 0 && targetCode === null;
  const valueError = watchedType === 'date' ? 'برای تاریخ شمسی از قالب 1405/05/12 یا 1405/05/12 14:32 استفاده کنید.' : undefined;

  useEffect(() => {
    if (editingName !== undefined) return;
    form.setValue('value', Array.isArray(normalizeAttributeValue(watchedType, '')) ? '' : String(normalizeAttributeValue(watchedType, '')));
  }, [editingName, form, watchedType]);

  const submitForm = (values: AttributeFormValues): void => {
    if (editingName === undefined && values.name in leg) {
      form.setError('name', { message: 'نام Attribute تکراری است.' });
      return;
    }
    onSubmit(values.name, values.type, values.value, editingName);
    form.reset({ name: '', type: 'string', value: '' });
  };

  return (
    <form className="rounded-xl border border-border bg-surface p-4" onSubmit={(event) => { void form.handleSubmit(submitForm)(event); }}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-text">{editingName === undefined ? 'افزودن Attribute' : 'ویرایش Attribute'}</h2>
        <p className="text-sm text-secondary">نام‌ها همان کلیدهای داخل هر عضو attrsList هستند و wrapper JSON تغییر نمی‌کند.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_12rem_1.5fr_auto] lg:items-start">
        <div>
          <Input label="name" list="transaction-source-fields" {...form.register('name')} error={form.formState.errors.name?.message} />
          <datalist id="transaction-source-fields">
            {sourceFields.map((fieldName) => (
              <option key={fieldName} value={fieldName} />
            ))}
          </datalist>
          {isUnmapped ? <p className="mt-2 text-xs text-warning">این فیلد در Payload ارسال نخواهد شد.</p> : null}
          {targetCode !== null ? <p className="mt-2 text-xs text-secondary">کد مقصد: {targetCode}</p> : null}
        </div>
        <Select label="type" options={attributeTypeOptions} {...form.register('type')} />
        {watchedType === 'list' ? (
          <Textarea label="value" hint="آیتم‌ها را با کاما جدا کنید." {...form.register('value')} error={form.formState.errors.value?.message} />
        ) : (
          <Input label="value" type={watchedType === 'boolean' ? 'text' : 'text'} hint={valueError} {...form.register('value')} error={form.formState.errors.value?.message} />
        )}
        <div className="flex gap-2 pt-7">
          <Button type="submit" size="sm">{editingName === undefined ? 'افزودن' : 'ذخیره'}</Button>
          {editingName !== undefined ? <Button type="button" variant="outline" size="sm" onClick={onCancelEdit}>لغو</Button> : null}
        </div>
      </div>
    </form>
  );
}
