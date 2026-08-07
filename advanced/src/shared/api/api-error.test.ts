/**
 * هدف فایل: تست تبدیل خطاهای برنامه به پیام فارسی امن.
 * جایگاه معماری: تست واحد shared/api.
 */
import { describe, expect, it } from 'vitest';

import { AppError, toUserMessage } from './api-error';

describe('AppError', () => {
  it('باید خطای ناشناخته را به پیام فارسی امن تبدیل کند', () => {
    expect(toUserMessage(new Error('Raw English stack'))).toBe('خطای پیش‌بینی‌نشده رخ داد.');
  });

  it('باید traceId را برای خطای شبکه نگه دارد', () => {
    const error = AppError.network('قطع ارتباط رخ داد.', { traceId: 'req-1' });

    expect(error.code).toBe('NETWORK');
    expect(error.traceId).toBe('req-1');
  });
});
