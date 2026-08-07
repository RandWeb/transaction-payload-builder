/**
 * هدف فایل: Header اصلی برنامه با لوگو، وضعیت API و کنترل تم.
 * جایگاه معماری: app/components در AppLayout.
 */
import { Menu } from 'lucide-react';

import { appConfig } from '@/config/app-config';
import { ApiStatusBadge } from '@/app/components/ApiStatusBadge';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { Badge } from '@/shared/components/ui/Badge';
import { Button } from '@/shared/components/ui/Button';

export interface AppHeaderProps {
  readonly onOpenSidebar: () => void;
}

/**
 * Header واکنش‌گرا بدون اطلاعات کاربر یا خروج.
 *
 * @param props - callback باز کردن Sidebar در موبایل.
 * @returns Header اصلی برنامه.
 * @example
 * <AppHeader onOpenSidebar={open} />
 */
export function AppHeader({ onOpenSidebar }: AppHeaderProps): JSX.Element {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Button className="lg:hidden" type="button" variant="ghost" size="sm" onClick={onOpenSidebar} aria-label="باز کردن منو">
            <Menu className="size-5" aria-hidden="true" />
          </Button>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary font-bold text-white">FTF</div>
          <div>
            <p className="font-bold">{appConfig.appName}</p>
            <p className="hidden text-xs text-secondary sm:block">سامانه مدیریت تراکنش Fraud</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:block"><ApiStatusBadge /></div>
          <div className="hidden xl:block"><Badge variant="neutral">Mapping: 1.0.0</Badge></div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
