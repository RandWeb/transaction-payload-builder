/**
 * هدف فایل: ناوبری اصلی برنامه با حالت ثابت دسکتاپ و Drawer موبایل.
 * جایگاه معماری: app/components در AppLayout.
 */
import {
  Clock3,
  FileCode2,
  History,
  LayoutDashboard,
  Settings,
  TableProperties,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { cn } from '@/shared/lib/cn';

const productionNavItems = [
  { to: '/workspace', label: 'میز کار', icon: LayoutDashboard },
  { to: '/mappings', label: 'کدینگ', icon: TableProperties },
  { to: '/history', label: 'تاریخچه', icon: History },
  { to: '/templates', label: 'قالب‌ها', icon: FileCode2 },
  { to: '/settings', label: 'تنظیمات', icon: Settings },
] as const;

const navItems = import.meta.env.DEV
  ? [...productionNavItems, { to: '/__ui', label: 'پیش‌نمایش UI', icon: Clock3 }]
  : productionNavItems;

export interface AppSidebarProps {
  readonly onNavigate?: () => void;
}

/**
 * لینک‌های اصلی برنامه را به‌صورت قابل استفاده با کیبورد نمایش می‌دهد.
 *
 * @param props - callback اختیاری پس از کلیک برای بستن Drawer.
 * @returns Sidebar ناوبری.
 * @example
 * <AppSidebar onNavigate={close} />
 */
export function AppSidebar({ onNavigate }: AppSidebarProps): JSX.Element {
  return (
    <nav className="space-y-2 p-3" aria-label="ناوبری اصلی">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary',
              isActive ? 'bg-primary text-white' : 'text-secondary hover:bg-muted hover:text-text',
            )
          }
        >
          <item.icon className="size-5" aria-hidden="true" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
