/**
 * هدف فایل: گرفتن خطاهای پیش‌بینی‌نشده React و نمایش UI فارسی بازیابی.
 * جایگاه معماری: ErrorBoundary سراسری در لایه app/providers.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';

import { AppError } from '@/shared/api/api-error';
import { ErrorAlert } from '@/shared/components/ErrorAlert';
import { Button } from '@/shared/components/ui/Button';

interface ErrorBoundaryProps {
  readonly children: ReactNode;
}

interface ErrorBoundaryState {
  readonly error: AppError | null;
}

/**
 * خطاهای رندر را به جای سفید شدن صفحه با پیام فارسی نمایش می‌دهد.
 *
 * @param props - children برنامه.
 * @returns children یا UI خطای سراسری.
 * @example
 * <ErrorBoundary><App /></ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = { error: null };

  public static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      error:
        error instanceof AppError
          ? error
          : new AppError({ code: 'UNKNOWN', messageFa: 'خطای پیش‌بینی‌نشده در برنامه رخ داد.', details: String(error) }),
    };
  }

  public override componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('خطای ErrorBoundary', error, info);
    }
  }

  public override render(): ReactNode {
    if (this.state.error === null) {
      return this.props.children;
    }

    return (
      <main className="min-h-dvh bg-bg p-6 text-text">
        <div className="mx-auto max-w-2xl rounded-xl bg-surface p-6 shadow-[var(--shadow-card)]">
          <ErrorAlert error={this.state.error} />
          <Button className="mt-4" onClick={() => this.setState({ error: null })}>
            بازیابی
          </Button>
        </div>
      </main>
    );
  }
}
