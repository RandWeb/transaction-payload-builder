/**
 * هدف فایل: نمایش خطای مسیرهای React Router با ErrorAlert فارسی.
 * جایگاه معماری: app و errorElement مشترک برای Route ها.
 */
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { AppError } from '@/shared/api/api-error';
import { ErrorAlert } from '@/shared/components/ErrorAlert';

/**
 * خطاهای مسیر را به AppError قابل نمایش تبدیل می‌کند.
 *
 * @returns کامپوننت Alert خطای route.
 * @example
 * <RouteError />
 */
export function RouteError(): JSX.Element {
  const routeError = useRouteError();
  const error = isRouteErrorResponse(routeError)
    ? new AppError({ code: 'UNKNOWN', messageFa: `خطای مسیر با کد ${routeError.status} رخ داد.` })
    : new AppError({ code: 'UNKNOWN', messageFa: 'بارگذاری این صفحه ناموفق بود.', details: String(routeError) });

  return <ErrorAlert error={error} />;
}
