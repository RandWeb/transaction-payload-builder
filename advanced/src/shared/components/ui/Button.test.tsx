/**
 * هدف فایل: تست رفتارهای اصلی Button شامل loading و disabled.
 * جایگاه معماری: تست واحد shared/ui.
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@/shared/components/ui/Button';

describe('Button', () => {
  it('باید در حالت loading غیرقابل کلیک باشد', async () => {
    const handleClick = vi.fn();
    render(<Button isLoading onClick={handleClick}>ارسال</Button>);

    await userEvent.click(screen.getByRole('button', { name: /ارسال/ }));

    expect(handleClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button').getAttribute('aria-busy')).toBe('true');
  });
});
