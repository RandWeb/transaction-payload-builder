/**
 * هدف فایل: مدیریت وضعیت باز/بسته بودن پنل‌ها و دیالوگ‌ها.
 * جایگاه معماری: هوک shared برای کامپوننت‌های کنترل‌شونده UI.
 */
import { useCallback, useState } from 'react';

interface DisclosureState {
  readonly isOpen: boolean;
  readonly open: () => void;
  readonly close: () => void;
  readonly toggle: () => void;
}

/**
 * وضعیت ساده باز/بسته را با اکشن‌های پایدار فراهم می‌کند.
 *
 * @param initialOpen - وضعیت اولیه باز بودن.
 * @returns وضعیت و اکشن‌های open، close و toggle.
 * @example
 * const dialog = useDisclosure();
 */
export function useDisclosure(initialOpen = false): DisclosureState {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const open = useCallback((): void => setIsOpen(true), []);
  const close = useCallback((): void => setIsOpen(false), []);
  const toggle = useCallback((): void => setIsOpen((current) => !current), []);

  return { isOpen, open, close, toggle };
}
