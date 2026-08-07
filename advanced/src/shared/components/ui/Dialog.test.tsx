/**
 * هدف فایل: تست دسترس‌پذیری و رفتار بستن Dialog با Escape.
 * جایگاه معماری: تست واحد shared/ui.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@/shared/components/ui/Button';
import { Dialog } from '@/shared/components/ui/Dialog';

describe('Dialog', () => {
  it('باید با Escape بسته شود و Focus را به trigger برگرداند', async () => {
    const handleClose = vi.fn();
    render(
      <>
        <Button>بازکننده</Button>
        <Dialog isOpen title="عنوان دیالوگ" onClose={handleClose}>
          <Button>تأیید</Button>
        </Dialog>
      </>,
    );

    screen.getByRole('button', { name: 'بازکننده' }).focus();
    await userEvent.keyboard('{Escape}');

    expect(handleClose).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'بازکننده' }));
  });
});
