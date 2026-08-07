/**
 * هدف فایل: تغییر تم روشن، تاریک و سیستم در Header برنامه.
 * جایگاه معماری: کامپوننت app/components متصل به ThemeProvider.
 */
import { Monitor, Moon, Sun } from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';
import { useTheme, type ThemeMode } from '@/shared/hooks/useTheme';

const modes: readonly { readonly value: ThemeMode; readonly label: string; readonly icon: JSX.Element }[] = [
  { value: 'light', label: 'روشن', icon: <Sun className="size-4" aria-hidden="true" /> },
  { value: 'dark', label: 'تاریک', icon: <Moon className="size-4" aria-hidden="true" /> },
  { value: 'system', label: 'سیستم', icon: <Monitor className="size-4" aria-hidden="true" /> },
];

/**
 * کنترل تغییر تم با سه حالت مجاز پروژه.
 *
 * @returns گروه دکمه‌های تغییر تم.
 * @example
 * <ThemeToggle />
 */
export function ThemeToggle(): JSX.Element {
  const { mode, setMode } = useTheme();

  return (
    <div className="flex rounded-xl border border-border bg-surface p-1" aria-label="تغییر تم">
      {modes.map((item) => (
        <Button
          key={item.value}
          type="button"
          variant={mode === item.value ? 'primary' : 'ghost'}
          size="sm"
          leftIcon={item.icon}
          onClick={() => setMode(item.value)}
          aria-label={`تم ${item.label}`}
        >
          <span className="hidden sm:inline">{item.label}</span>
        </Button>
      ))}
    </div>
  );
}
