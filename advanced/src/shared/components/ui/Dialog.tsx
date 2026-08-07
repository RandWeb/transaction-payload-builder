/**
 * هدف فایل: دیالوگ پایه با Focus Trap، بستن با Esc و بازگشت Focus.
 * جایگاه معماری: shared/ui برای مودال‌های تأیید، فرم و جزئیات.
 */
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';

export interface DialogProps {
  readonly isOpen: boolean;
  readonly title: string;
  readonly children: ReactNode;
  readonly onClose: () => void;
  readonly description?: string;
  readonly footer?: ReactNode;
  readonly className?: string;
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * دیالوگ استاندارد با مدیریت فوکوس و semantics مناسب.
 *
 * @param props - وضعیت باز بودن، عنوان، محتوای دیالوگ و onClose.
 * @returns مودال Portal شده یا null در حالت بسته.
 * @example
 * <Dialog isOpen title="حذف" onClose={close}>متن</Dialog>
 */
export function Dialog({ isOpen, title, description, children, footer, onClose, className }: DialogProps): JSX.Element | null {
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    lastFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusableElements = panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
    focusableElements?.[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key !== 'Tab' || panelRef.current === null) {
        return;
      }

      const elements = Array.from(panelRef.current.querySelectorAll<HTMLElement>(focusableSelector));
      const firstElement = elements[0];
      const lastElement = elements.at(-1);

      if (firstElement === undefined || lastElement === undefined) {
        event.preventDefault();
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      lastFocusedElementRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-text/40 p-4" onMouseDown={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description === undefined ? undefined : 'dialog-description'}
        className={cn('max-h-[90dvh] w-full max-w-lg overflow-auto rounded-xl border border-border bg-surface p-6 text-text shadow-[var(--shadow-card)]', className)}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="dialog-title" className="text-lg font-bold">{title}</h2>
            {description !== undefined ? <p id="dialog-description" className="mt-2 text-sm text-secondary">{description}</p> : null}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="بستن دیالوگ">
            ×
          </Button>
        </div>
        <div className="mt-5">{children}</div>
        {footer !== undefined ? <div className="mt-6 flex justify-end gap-3">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
