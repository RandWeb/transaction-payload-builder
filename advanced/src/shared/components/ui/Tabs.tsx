/**
 * هدف فایل: تب‌های کنترل‌شونده با ناوبری کیبورد سازگار با RTL.
 * جایگاه معماری: shared/ui برای تفکیک نماهای صفحات.
 */
import type { KeyboardEvent, ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export interface TabItem {
  readonly value: string;
  readonly label: string;
  readonly content: ReactNode;
}

export interface TabsProps {
  readonly items: readonly TabItem[];
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly className?: string;
}

/**
 * تب کنترل‌شونده با پشتیبانی ArrowLeft و ArrowRight در RTL.
 *
 * @param props - لیست تب‌ها، مقدار فعال و callback تغییر.
 * @returns ساختار tabs با role های استاندارد.
 * @example
 * <Tabs items={items} value="json" onChange={setValue} />
 */
export function Tabs({ items, value, onChange, className }: TabsProps): JSX.Element {
  const activeIndex = Math.max(0, items.findIndex((item) => item.value === value));
  const activeItem = items[activeIndex] ?? items[0];

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number): void => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const direction = event.key === 'ArrowLeft' ? 1 : -1;
    const nextItem = items[(index + direction + items.length) % items.length];
    if (nextItem !== undefined) onChange(nextItem.value);
  };

  return (
    <div className={className}>
      <div role="tablist" className="flex gap-2 border-b border-border">
        {items.map((item, index) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={item.value === value}
            className={cn(
              'rounded-t-xl px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary',
              item.value === value ? 'bg-primary text-white' : 'text-secondary hover:bg-muted',
            )}
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pt-4">
        {activeItem?.content}
      </div>
    </div>
  );
}
