/**
 * هدف فایل: فیلترهای جدول تاریخچه ارسال.
 * جایگاه معماری: features/submissions/components و کنترل ورودی‌های جستجو.
 */
import type { SubmissionFilter } from '@/shared/db';
import { Input, Select } from '@/shared/components/ui';

export interface SubmissionFiltersProps {
  readonly filter: SubmissionFilter;
  readonly onChange: (filter: SubmissionFilter) => void;
}

/**
 * کنترل‌های فیلتر وضعیت، نسخه Mapping، تاریخ شمسی و شناسه تراکنش را نمایش می‌دهد.
 *
 * @param props - فیلتر فعلی و callback تغییر.
 * @returns فرم فیلتر تاریخچه.
 */
export function SubmissionFilters({ filter, onChange }: SubmissionFiltersProps): JSX.Element {
  return (
    <div className="grid gap-3 rounded-xl border border-border bg-surface p-4 md:grid-cols-5">
      <Input label="جستجو در شناسه" value={filter.query ?? ''} onChange={(event) => onChange({ ...filter, query: event.target.value })} />
      <Input label="از تاریخ شمسی" placeholder="1405/05/13" value={filter.dateFrom ?? ''} onChange={(event) => onChange({ ...filter, dateFrom: event.target.value })} />
      <Input label="تا تاریخ شمسی" placeholder="1405/05/13" value={filter.dateTo ?? ''} onChange={(event) => onChange({ ...filter, dateTo: event.target.value })} />
      <Input label="نسخه Mapping" value={filter.mappingVersion ?? ''} onChange={(event) => onChange({ ...filter, mappingVersion: event.target.value.trim() === '' ? undefined : event.target.value })} />
      <Select
        label="وضعیت"
        value={filter.status ?? ''}
        onChange={(event) => onChange({ ...filter, status: event.target.value === '' ? undefined : event.target.value as SubmissionFilter['status'] })}
        options={[
          { value: '', label: 'همه' },
          { value: 'pending', label: 'در انتظار' },
          { value: 'success', label: 'موفق' },
          { value: 'failed', label: 'ناموفق' },
          { value: 'cancelled', label: 'لغوشده' },
        ]}
      />
    </div>
  );
}
