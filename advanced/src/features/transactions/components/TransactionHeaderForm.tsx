/**
 * هدف فایل: فرم ویرایش Header واقعی تراکنش مطابق wrapper `mainTransaction`.
 * جایگاه معماری: features/transactions/components و بخش بالایی ویرایشگر تراکنش.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { Transaction } from '@/features/transactions';
import { Button, Input } from '@/shared/components/ui';
import { isValidJalaliDateTime, normalizeAttributeValue } from '../utils/transaction-normalizer';

const headerFormSchema = z.object({
  fraudMessageId: z.string().min(1, 'شناسه پیام Fraud الزامی است.'),
  sysName: z.string().min(1, 'نام سیستم الزامی است.'),
  businessId: z.string().min(1, 'شناسه کسب‌وکار الزامی است.'),
  transactionTypeCode: z.string().optional(),
  transactionChannel: z.string().optional(),
  transactionDate: z.string().refine((value) => !value.includes('/') || isValidJalaliDateTime(value), 'تاریخ شمسی واردشده معتبر نیست.'),
  transactionAmount: z.string().min(1, 'مبلغ تراکنش الزامی است.'),
});

type HeaderFormValues = z.infer<typeof headerFormSchema>;

export interface TransactionHeaderFormProps {
  readonly transaction: Transaction;
  readonly onSubmit: (transaction: Transaction) => void;
}

/**
 * فرم Header را بدون افزودن کلید خارج از ساختار `docs/transaction.json` ذخیره می‌کند.
 *
 * @param props - تراکنش فعلی و callback ذخیره.
 * @returns فرم کنترل‌شده Header و چند فیلد پرکاربرد ردیف اول.
 */
export function TransactionHeaderForm({ transaction, onSubmit }: TransactionHeaderFormProps): JSX.Element {
  const firstLeg = transaction.mainTransaction.attrsList[0] ?? {};
  const form = useForm<HeaderFormValues>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    resolver: zodResolver(headerFormSchema),
    values: {
      fraudMessageId: transaction.mainTransaction.fraudMessageId,
      sysName: transaction.mainTransaction.sysName,
      businessId: transaction.mainTransaction.businessId,
      transactionTypeCode: String(firstLeg.TransactionTypeCode ?? ''),
      transactionChannel: String(firstLeg.TransactionChannel ?? ''),
      transactionDate: String(firstLeg.TransactionDate ?? ''),
      transactionAmount: String(firstLeg.TransactionAmount ?? ''),
    },
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      void form.handleSubmit(handleSubmit)();
    });
    return () => subscription.unsubscribe();
  });

  const handleSubmit = (values: HeaderFormValues): void => {
    const attrsList = transaction.mainTransaction.attrsList.map((leg, index) =>
      index === 0
        ? {
            ...leg,
            TransactionTypeCode: values.transactionTypeCode ?? '',
            TransactionChannel: values.transactionChannel ?? '',
            TransactionDate: normalizeAttributeValue('date', values.transactionDate),
            TransactionAmount: normalizeAttributeValue('number', values.transactionAmount),
          }
        : leg,
    );

    onSubmit({
      mainTransaction: {
        fraudMessageId: values.fraudMessageId,
        sysName: values.sysName,
        businessId: values.businessId,
        attrsList,
      },
    });
  };

  const generateFraudMessageId = (): void => {
    form.setValue('fraudMessageId', crypto.randomUUID(), { shouldDirty: true, shouldValidate: true });
    void form.handleSubmit(handleSubmit)();
  };

  return (
    <form className="rounded-xl border border-border bg-surface p-4" onSubmit={(event) => { void form.handleSubmit(handleSubmit)(event); }}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">مشخصات اصلی تراکنش</h2>
          <p className="text-sm text-secondary">ذخیره با ساختار دقیق mainTransaction و attrsList انجام می‌شود.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={generateFraudMessageId}>
          تولید شناسه
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Input label="fraudMessageId" {...form.register('fraudMessageId')} error={form.formState.errors.fraudMessageId?.message} />
        <Input label="sysName" {...form.register('sysName')} error={form.formState.errors.sysName?.message} />
        <Input label="businessId" {...form.register('businessId')} error={form.formState.errors.businessId?.message} />
        <Input label="TransactionTypeCode" {...form.register('transactionTypeCode')} error={form.formState.errors.transactionTypeCode?.message} />
        <Input label="TransactionChannel" {...form.register('transactionChannel')} error={form.formState.errors.transactionChannel?.message} />
        <Input label="TransactionDate" hint="میلادی مثل نمونه یا شمسی مثل 1405/05/12 14:32" {...form.register('transactionDate')} error={form.formState.errors.transactionDate?.message} />
        <Input label="TransactionAmount" inputMode="numeric" {...form.register('transactionAmount')} error={form.formState.errors.transactionAmount?.message} />
      </div>
    </form>
  );
}
