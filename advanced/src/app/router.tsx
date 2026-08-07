/**
 * هدف فایل: تعریف مسیرهای اصلی برنامه با React Router و Lazy Loading.
 * جایگاه معماری: app و مرجع مرکزی Routing.
 */
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppLayout } from '@/app/layouts/AppLayout';
import { RouteError } from '@/app/RouteError';
import { Spinner } from '@/shared/components/ui/Spinner';

const WorkspacePage = lazy(() => import('@/pages/WorkspacePage'));
const MappingsPage = lazy(() => import('@/pages/MappingsPage'));
const MappingDetailPage = lazy(() => import('@/pages/MappingDetailPage'));
const HistoryPage = lazy(() => import('@/pages/HistoryPage'));
const SubmissionDetailPage = lazy(() => import('@/pages/SubmissionDetailPage'));
const TemplatesPage = lazy(() => import('@/pages/TemplatesPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

/**
 * صفحه lazy را داخل Suspense مشترک رندر می‌کند.
 *
 * @param element - کامپوننت صفحه lazy شده.
 * @returns عنصر آماده برای Route.
 */
function withSuspense(element: JSX.Element): JSX.Element {
  return (
    <Suspense fallback={<div className="flex min-h-64 items-center justify-center"><Spinner /></div>}>
      {element}
    </Suspense>
  );
}

const developmentRoutes = (() => {
  if (!import.meta.env.DEV) return [];
  const UiPreviewPage = lazy(() => import('@/app/UiPreviewPage').then((module) => ({ default: module.UiPreviewPage })));
  return [{ path: '__ui', element: withSuspense(<UiPreviewPage />), errorElement: <RouteError /> }];
})();

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Navigate to="/workspace" replace /> },
      { path: 'workspace', element: withSuspense(<WorkspacePage />), errorElement: <RouteError /> },
      { path: 'mappings', element: withSuspense(<MappingsPage />), errorElement: <RouteError /> },
      { path: 'mappings/:version', element: withSuspense(<MappingDetailPage />), errorElement: <RouteError /> },
      { path: 'history', element: withSuspense(<HistoryPage />), errorElement: <RouteError /> },
      { path: 'history/:id', element: withSuspense(<SubmissionDetailPage />), errorElement: <RouteError /> },
      { path: 'templates', element: withSuspense(<TemplatesPage />), errorElement: <RouteError /> },
      { path: 'settings', element: withSuspense(<SettingsPage />), errorElement: <RouteError /> },
      ...developmentRoutes,
      { path: '*', element: withSuspense(<NotFoundPage />), errorElement: <RouteError /> },
    ],
  },
]);
