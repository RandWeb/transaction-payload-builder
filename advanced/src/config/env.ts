/**
 * هدف فایل: خواندن امن متغیرهای محیطی Vite و اعتبارسنجی Fail-Fast.
 * جایگاه معماری: تنها مسیر مجاز دسترسی به env در کل پروژه.
 */
import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url('آدرس پایه API باید یک URL معتبر باشد.'),
  VITE_TRANSACTION_ENDPOINT: z.string().min(1, 'مسیر ارسال تراکنش الزامی است.'),
  VITE_USE_MOCK_API: z
    .enum(['true', 'false'], {
      errorMap: () => ({ message: 'حالت Mock API باید true یا false باشد.' }),
    })
    .transform((value) => value === 'true'),
  VITE_REQUEST_TIMEOUT_MS: z.coerce
    .number({
      invalid_type_error: 'Timeout درخواست باید عددی باشد.',
    })
    .int('Timeout درخواست باید عدد صحیح باشد.')
    .positive('Timeout درخواست باید بزرگ‌تر از صفر باشد.'),
  VITE_APP_ENV: z.enum(['development', 'test', 'production'], {
    errorMap: () => ({ message: 'محیط برنامه باید development، test یا production باشد.' }),
  }),
  VITE_API_TOKEN: z.string().optional(),
  VITE_MOCK_SCENARIO: z.enum(['success', 'validation-error', 'server-error', 'timeout', 'network-error', 'slow']).optional(),
});

/**
 * متغیرهای محیطی Parse شده برای جلوگیری از اجرای برنامه با تنظیمات ناقص.
 *
 * @returns آبجکت معتبر env با تبدیل نوع‌های لازم.
 * @throws Error فارسی در صورت ناقص یا نامعتبر بودن env.
 */
function parseEnv(): z.infer<typeof envSchema> {
  const parsedEnv = envSchema.safeParse(import.meta.env);

  if (!parsedEnv.success) {
    const messageFa = parsedEnv.error.issues.map((issue) => issue.message).join('، ');
    throw new Error(`تنظیمات محیطی نامعتبر است: ${messageFa}`);
  }

  return parsedEnv.data;
}

export const env = parseEnv();
