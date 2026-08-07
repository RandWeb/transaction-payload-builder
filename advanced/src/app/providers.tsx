/**
 * هدف فایل: تجمیع Provider های سطح برنامه در هر مرحله توسعه.
 * جایگاه معماری: لایه app و نقطه اتصال سرویس‌های سراسری به React.
 */
import { ThemeProvider } from '@/shared/hooks/useTheme';
import { ToastProvider } from '@/shared/hooks/useToast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { ErrorBoundary } from '@/app/components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Provider های سراسری برنامه را به‌ترتیب معماری تزریق می‌کند.
 *
 * @param props - children برنامه که باید زیر Provider ها اجرا شود.
 * @returns درخت React با Provider های فعال.
 * @example
 * <AppProviders><App /></AppProviders>
 */
export function AppProviders({ children }: { readonly children: ReactNode }): JSX.Element {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>{children}</ToastProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
