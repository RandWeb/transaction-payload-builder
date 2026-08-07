/**
 * هدف فایل: نمایش و فیلتر Attributeهای ردیف انتخاب‌شده تراکنش.
 * جایگاه معماری: features/transactions/components و نمای لیستی/جدولی Attributeها.
 */
import { useMemo, useState } from 'react';

import type { Mapping } from '@/features/mappings';
import type { TransactionLeg } from '@/features/transactions';
import { EmptyState } from '@/shared/components';
import { Badge, Button, Input, Select, Table, TableContainer, TBody, TD, TH, THead, TR } from '@/shared/components/ui';
import { maskSensitive, toPersianDigits } from '@/shared/lib/format';
import { TransactionAttributeCard } from './TransactionAttributeCard';
import { findTargetCode } from '../utils/transaction-normalizer';

type AttributeFilter = 'all' | 'mapped' | 'unmapped' | 'empty';

export interface TransactionAttributeListProps {
  readonly leg: TransactionLeg;
  readonly activeMapping: Mapping | null;
  readonly editingName?: string;
  readonly onEdit: (name: string) => void;
  readonly onDelete: (name: string) => void;
}

const filterOptions = [
  { value: 'all', label: 'همه' },
  { value: 'mapped', label: 'نگاشت‌شده' },
  { value: 'unmapped', label: 'نگاشت‌نشده' },
  { value: 'empty', label: 'خالی' },
] as const;

const isEmptyValue = (value: unknown): boolean => value === '' || (Array.isArray(value) && value.length === 0);

/**
 * لیست Attributeها را با جستجو، فیلتر و شمارش مقداردهی نمایش می‌دهد.
 *
 * @param props - ردیف تراکنش، Mapping فعال و handlerهای عملیات.
 * @returns لیست کارت موبایل و جدول دسکتاپ.
 */
export function TransactionAttributeList({ leg, activeMapping, editingName, onEdit, onDelete }: TransactionAttributeListProps): JSX.Element {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<AttributeFilter>('all');
  const attributes = useMemo(() => Object.entries(leg), [leg]);
  const valuedCount = attributes.filter(([, value]) => !isEmptyValue(value)).length;
  const filteredAttributes = attributes.filter(([name, value]) => {
    const matchesSearch = name.toLowerCase().includes(search.trim().toLowerCase()) || String(value).toLowerCase().includes(search.trim().toLowerCase());
    const targetCode = findTargetCode(activeMapping, name);
    if (!matchesSearch) return false;
    if (filter === 'mapped') return targetCode !== null;
    if (filter === 'unmapped') return targetCode === null;
    if (filter === 'empty') return isEmptyValue(value);
    return true;
  });

  return (
    <section className="space-y-4 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-text">Attributeهای attrsList</h2>
          <p className="text-sm text-secondary">فقط کلیدهای داخل ردیف انتخاب‌شده ویرایش می‌شوند.</p>
        </div>
        <Badge variant="neutral">
          {toPersianDigits(valuedCount)} از {toPersianDigits(attributes.length)} فیلد مقداردهی شده
        </Badge>
      </div>
      <div className="grid gap-3 md:grid-cols-[1fr_14rem]">
        <Input label="جستجو" value={search} onChange={(event) => setSearch(event.target.value)} />
        <Select label="فیلتر" options={filterOptions} value={filter} onChange={(event) => setFilter(event.target.value as AttributeFilter)} />
      </div>
      {filteredAttributes.length === 0 ? (
        <EmptyState title="Attribute پیدا نشد" description="عبارت جستجو یا فیلتر را تغییر دهید." />
      ) : (
        <>
          <div className="space-y-3 lg:hidden">
            {filteredAttributes.map(([name, value]) => (
              <TransactionAttributeCard key={name} name={name} value={value} activeMapping={activeMapping} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </div>
          <div className="hidden lg:block">
            <TableContainer>
              <Table>
                <THead>
                  <TR>
                    <TH>نام</TH>
                    <TH>مقدار</TH>
                    <TH>کد مقصد</TH>
                    <TH>عملیات</TH>
                  </TR>
                </THead>
                <TBody>
                  {filteredAttributes.map(([name, value]) => {
                    const targetCode = findTargetCode(activeMapping, name);
                    const rawValue = Array.isArray(value) ? value.join(', ') : String(value);
                    const displayValue = /(Card|Account|Iban|National|Deposit|Beneficiary|Receiver|Owner|Originator)/i.test(name) ? maskSensitive(rawValue) : rawValue;
                    return (
                      <TR key={name} className={editingName === name ? 'bg-muted' : undefined}>
                        <TD className="max-w-[16rem] break-all whitespace-normal">{name}</TD>
                        <TD className="max-w-[24rem] break-all whitespace-normal">{toPersianDigits(displayValue)}</TD>
                        <TD>{targetCode === null ? <Badge variant="warning">ندارد</Badge> : <Badge variant="info">{targetCode}</Badge>}</TD>
                        <TD>
                          <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => onEdit(name)}>ویرایش</Button>
                            <Button type="button" variant="danger" size="sm" onClick={() => onDelete(name)}>حذف</Button>
                          </div>
                        </TD>
                      </TR>
                    );
                  })}
                </TBody>
              </Table>
            </TableContainer>
          </div>
        </>
      )}
    </section>
  );
}
