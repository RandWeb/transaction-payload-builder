/**
 * هدف فایل: نمایش جدول/کارت‌های Mapping با جستجو، فیلتر، مرتب‌سازی و صفحه‌بندی.
 * جایگاه معماری: features/mappings/components و نمای اصلی لیست Mapping.
 */
import { useEffect, useMemo, useState } from 'react';

import { Badge, Button, Input, Select, Table, TableContainer, TBody, TD, TH, THead, TR } from '@/shared/components/ui';
import type { MappingFilter, MappingRow, MappingSortKey } from '../utils/mapping-manager';
import { filterMappingRows } from '../utils/mapping-manager';

export interface MappingTableProps {
  readonly rows: readonly MappingRow[];
  readonly selectedCode?: string;
  readonly onEdit: (row: MappingRow) => void;
}

const filterOptions = [
  { value: 'all', label: 'همه' },
  { value: 'required', label: 'الزامی' },
  { value: 'transform', label: 'دارای Transform' },
  { value: 'empty', label: 'بدون منبع' },
];

const sortOptions = [
  { value: 'code', label: 'کد' },
  { value: 'sourceField', label: 'نام' },
];

const pageSize = 25;

const statusVariant = {
  ok: 'success',
  warning: 'warning',
  error: 'error',
} as const;

/**
 * جدول Mapping را در دسکتاپ و Card List را در موبایل نمایش می‌دهد.
 *
 * @param props - ردیف‌ها، کد انتخاب‌شده و callback ویرایش.
 * @returns جدول responsive Mapping.
 */
export function MappingTable({ rows, selectedCode, onEdit }: MappingTableProps): JSX.Element {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filter, setFilter] = useState<MappingFilter>('all');
  const [sortKey, setSortKey] = useState<MappingSortKey>('code');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const filteredRows = useMemo(() => filterMappingRows(rows, debouncedQuery, filter, sortKey), [debouncedQuery, filter, rows, sortKey]);
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, filter, sortKey]);

  return (
    <section className="space-y-4 rounded-xl border border-border bg-surface p-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_12rem_12rem]">
        <Input label="جستجوی زنده" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="کد یا نام فیلد" />
        <Select label="فیلتر" options={filterOptions} value={filter} onChange={(event) => setFilter(event.target.value as MappingFilter)} />
        <Select label="مرتب‌سازی" options={sortOptions} value={sortKey} onChange={(event) => setSortKey(event.target.value as MappingSortKey)} />
      </div>

      <div className="hidden md:block">
        <TableContainer className="max-h-[32rem] overflow-auto">
          <Table>
            <THead>
              <TR>
                <TH>کد مقصد</TH>
                <TH>نام فیلد منبع</TH>
                <TH>برچسب فارسی</TH>
                <TH>نوع</TH>
                <TH>الزامی</TH>
                <TH>Transform</TH>
                <TH>وضعیت</TH>
                <TH>عملیات</TH>
              </TR>
            </THead>
            <TBody>
              {visibleRows.map((row) => (
                <TR key={row.code} className={row.code === selectedCode ? 'bg-muted' : undefined}>
                  <TD className="font-mono">{row.code}</TD>
                  <TD className="font-mono">{row.sourceField}</TD>
                  <TD>{row.labelFa}</TD>
                  <TD>{row.valueType}</TD>
                  <TD>{row.required ? 'بله' : 'خیر'}</TD>
                  <TD>{row.transform}</TD>
                  <TD><Badge variant={statusVariant[row.status]}>{row.status}</Badge></TD>
                  <TD><Button type="button" size="sm" variant="outline" onClick={() => onEdit(row)}>ویرایش</Button></TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableContainer>
      </div>

      <div className="space-y-3 md:hidden">
        {visibleRows.map((row) => (
          <article key={row.code} className="space-y-2 rounded-xl border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <strong className="font-mono">{row.code}</strong>
              <Badge variant={statusVariant[row.status]}>{row.status}</Badge>
            </div>
            <p className="break-all font-mono text-sm text-text">{row.sourceField}</p>
            <p className="text-sm text-secondary">{row.labelFa} · {row.valueType} · {row.transform}</p>
            <Button type="button" size="sm" variant="outline" onClick={() => onEdit(row)}>ویرایش</Button>
          </article>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-secondary">
        <span>{filteredRows.length} ردیف · صفحه {page} از {pageCount}</span>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>قبلی</Button>
          <Button type="button" variant="outline" size="sm" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>بعدی</Button>
        </div>
      </div>
    </section>
  );
}
