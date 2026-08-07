/**
 * هدف فایل: اجزای جدول پایه با پشتیبانی از اسکرول افقی موبایل.
 * جایگاه معماری: shared/ui برای لیست‌ها و جدول‌های داده.
 */
import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>): JSX.Element {
  return <table className={cn('w-full border-collapse text-sm', className)} {...props} />;
}

export function TableContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return <div className={cn('w-full overflow-x-auto rounded-xl border border-border', className)} {...props} />;
}

export function THead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>): JSX.Element {
  return <thead className={cn('sticky top-0 bg-muted text-text', className)} {...props} />;
}

export function TBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>): JSX.Element {
  return <tbody className={cn('divide-y divide-border', className)} {...props} />;
}

export function TR({ className, ...props }: HTMLAttributes<HTMLTableRowElement>): JSX.Element {
  return <tr className={cn('transition hover:bg-muted/60', className)} {...props} />;
}

export function TH({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>): JSX.Element {
  return <th className={cn('whitespace-nowrap px-4 py-3 text-start font-semibold', className)} {...props} />;
}

export function TD({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>): JSX.Element {
  return <td className={cn('whitespace-nowrap px-4 py-3', className)} {...props} />;
}
