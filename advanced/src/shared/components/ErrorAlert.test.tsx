/**
 * هدف فایل: تست نمایش پیام فارسی و کد خطا در ErrorAlert.
 * جایگاه معماری: تست واحد shared/components.
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AppError } from '@/shared/api/api-error';
import { ErrorAlert } from '@/shared/components/ErrorAlert';

describe('ErrorAlert', () => {
  it('باید پیام فارسی و کد خطا را نمایش دهد', () => {
    render(<ErrorAlert error={AppError.validation('تاریخ معتبر نیست.')} />);

    expect(screen.getByRole('alert').textContent).toContain('تاریخ معتبر نیست.');
    expect(screen.getByRole('alert').textContent).toContain('VALIDATION');
  });
});
