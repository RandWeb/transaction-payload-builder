/**
 * هدف فایل: داده‌های پاسخ Mock API بدون وابستگی به شبکه واقعی.
 * جایگاه معماری: shared/api/mock و منبع پاسخ‌های نمونه.
 */

export interface MockSuccessResponse {
  readonly referenceId: string;
  readonly status: 'accepted';
  readonly receivedAt: string;
}

export interface MockValidationErrorResponse {
  readonly errors: readonly { readonly field: string; readonly message: string }[];
}

/**
 * پاسخ موفق Mock را برای درخواست ارسال تراکنش می‌سازد.
 *
 * @returns پاسخ موفق با شناسه رهگیری تصادفی.
 */
export function createMockSuccessResponse(): MockSuccessResponse {
  return {
    referenceId: crypto.randomUUID(),
    status: 'accepted',
    receivedAt: new Date().toISOString(),
  };
}

export const mockValidationErrorResponse: MockValidationErrorResponse = {
  errors: [{ field: '951', message: 'کد مقصد 951 در سرویس مقصد معتبر نیست.' }],
};
