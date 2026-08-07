/**
 * هدف فایل: پوسته اصلی برنامه با Header، Sidebar، Skip Link و Outlet.
 * جایگاه معماری: app/layouts برای همه صفحات اصلی.
 */
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import { AppHeader } from '@/app/components/AppHeader';
import { AppSidebar } from '@/app/components/AppSidebar';
import { useDisclosure } from '@/shared/hooks/useDisclosure';

/**
 * Layout اصلی با Drawer موبایل و Sidebar دسکتاپ.
 *
 * @returns ساختار کلی برنامه با محل رندر صفحات.
 * @example
 * <AppLayout />
 */
export function AppLayout(): JSX.Element {
  const sidebar = useDisclosure();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') sidebar.close();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebar]);

  return (
    <div className="min-h-dvh bg-bg text-text">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-primary focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-white focus:outline-none focus:ring-2 focus:ring-primary"
      >
        پرش به محتوای اصلی
      </a>
      <AppHeader onOpenSidebar={sidebar.open} />
      <div className="flex">
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 border-e border-border bg-surface lg:block">
          <AppSidebar />
        </aside>
        {sidebar.isOpen ? (
          <div className="fixed inset-0 z-40 bg-text/40 lg:hidden" onClick={sidebar.close} role="presentation">
            <aside className="h-full w-72 max-w-[85vw] border-e border-border bg-surface" onClick={(event) => event.stopPropagation()} aria-label="منوی اصلی">
              <AppSidebar onNavigate={sidebar.close} />
            </aside>
          </div>
        ) : null}
        <main id="main-content" className="min-w-0 flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
