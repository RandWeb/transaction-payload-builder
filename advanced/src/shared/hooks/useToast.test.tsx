/**
 * هدف فایل: تست Provider و hook اعلان‌های Toast.
 * جایگاه معماری: تست واحد shared/hooks.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Button } from '@/shared/components/ui/Button';
import { ToastProvider, useToast } from '@/shared/hooks/useToast';

function ToastTester(): JSX.Element {
  const { showToast } = useToast();
  return <Button onClick={() => showToast({ type: 'success', message: 'عملیات موفق بود.' })}>نمایش</Button>;
}

describe('useToast', () => {
  it('باید پیام toast را در aria-live نمایش دهد', async () => {
    render(
      <ToastProvider>
        <ToastTester />
      </ToastProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'نمایش' }));

    expect(screen.getByText('عملیات موفق بود.')).toBeTruthy();
  });
});
