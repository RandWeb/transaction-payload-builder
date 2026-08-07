/**
 * هدف فایل: مدیریت صف Toast های برنامه با aria-live و API ساده.
 * جایگاه معماری: هوک shared و Provider سراسری برای اعلان‌های UI.
 */
import type { ReactNode } from 'react';
import { createContext, createElement, useCallback, useContext, useMemo, useState } from 'react';

import { AppError } from '@/shared/api/api-error';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  readonly id: string;
  readonly type: ToastType;
  readonly message: string;
}

interface ToastContextValue {
  readonly toasts: readonly ToastItem[];
  readonly showToast: (toast: Omit<ToastItem, 'id'>) => string;
  readonly dismissToast: (id: string) => void;
}

const toastContext = createContext<ToastContextValue | null>(null);

/**
 * Provider اعلان‌ها که Toast ها را در گوشه صفحه نمایش می‌دهد.
 *
 * @param props - children برنامه زیر Provider.
 * @returns Provider و ناحیه aria-live اعلان‌ها.
 * @example
 * <ToastProvider><App /></ToastProvider>
 */
export function ToastProvider({ children }: { readonly children: ReactNode }): React.ReactElement {
  const [toasts, setToasts] = useState<readonly ToastItem[]>([]);
  const dismissToast = useCallback((id: string): void => setToasts((items) => items.filter((item) => item.id !== id)), []);
  const showToast = useCallback(
    (toast: Omit<ToastItem, 'id'>): string => {
      const id = crypto.randomUUID();
      setToasts((items) => [...items, { ...toast, id }]);
      window.setTimeout(() => dismissToast(id), 4000);
      return id;
    },
    [dismissToast],
  );
  const value = useMemo<ToastContextValue>(() => ({ toasts, showToast, dismissToast }), [dismissToast, showToast, toasts]);

  return createElement(
    toastContext.Provider,
    { value },
    children,
    createElement(
      'div',
      { 'aria-live': 'polite', className: 'fixed bottom-4 start-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3' },
      toasts.map((toast) =>
        createElement('div', { key: toast.id, className: 'rounded-xl border border-border bg-surface p-4 text-text shadow-[var(--shadow-card)]' }, toast.message),
      ),
    ),
  );
}

/**
 * API نمایش و حذف Toast را در اختیار کامپوننت‌ها قرار می‌دهد.
 *
 * @returns لیست Toast ها و توابع show/dismiss.
 * @throws AppError اگر خارج از ToastProvider استفاده شود.
 */
export function useToast(): ToastContextValue {
  const context = useContext(toastContext);
  if (context === null) throw new AppError({ code: 'UNKNOWN', messageFa: 'هوک اعلان خارج از محدوده Provider استفاده شده است.' });
  return context;
}
