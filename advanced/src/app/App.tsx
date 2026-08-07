/**
 * هدف فایل: اتصال RouterProvider به برنامه پس از آماده‌شدن App Shell.
 * جایگاه معماری: کامپوننت ریشه در لایه app و نقطه ورود Routing.
 */
import { RouterProvider } from 'react-router-dom';

import { router } from '@/app/router';

/**
 * کامپوننت ریشه که ناوبری کل برنامه را فعال می‌کند.
 *
 * @returns RouterProvider برنامه با مسیرهای تعریف‌شده.
 * @example
 * <App />
 */
export function App(): JSX.Element {
  return <RouterProvider router={router} />;
}
