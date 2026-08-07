/**
 * هدف فایل: helper رندر React Testing Library با QueryClient و Router.
 * جایگاه معماری: src/test/utils و زیرساخت مشترک تست‌های کامپوننتی.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { RenderOptions, RenderResult } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { ToastProvider } from '@/shared/hooks/useToast';

export interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  readonly route?: string;
  readonly queryClient?: QueryClient;
}

/**
 * یک کامپوننت را با Providerهای لازم برای تست رندر می‌کند.
 *
 * @param ui - عنصر React قابل رندر.
 * @param options - مسیر اولیه و QueryClient اختیاری.
 * @returns نتیجه render به‌همراه QueryClient.
 */
export function renderWithProviders(ui: ReactElement, options: RenderWithProvidersOptions = {}): RenderResult & { readonly queryClient: QueryClient } {
  const queryClient = options.queryClient ?? new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const route = options.route ?? '/';

  const Wrapper = ({ children }: { readonly children: ReactNode }): JSX.Element => (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>
  );

  return { ...render(ui, { ...options, wrapper: Wrapper }), queryClient };
}
