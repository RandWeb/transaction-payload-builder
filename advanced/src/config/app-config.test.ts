/**
 * هدف فایل: اطمینان از معتبر بودن ثابت‌های پایه پروژه در اسکلت اولیه.
 * جایگاه معماری: تست واحد برای پیکربندی غیرحساس لایه config.
 */
import { describe, expect, it } from 'vitest';

import { appConfig } from '@/config/app-config';

describe('appConfig', () => {
  it('باید محدوده کدهای مقصد را مطابق مستندات نگه دارد', () => {
    expect(appConfig.targetCodeRange).toEqual({ from: 951, to: 1000 });
  });
});
