import type { OutputPayload } from '../types/transaction.types';

const transactionApiUrl: unknown = import.meta.env.VITE_TRANSACTION_API_URL;

const API_URL =
  typeof transactionApiUrl === 'string' && transactionApiUrl.trim() !== ''
    ? transactionApiUrl
    : 'http://ip/transaction';

/** ارسال تراکنش تبدیل شده به API مقصد */
export async function submitTransaction(
  payload: OutputPayload,
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();

      return {
        success: false,
        message: `خطای سرور (${response.status}): ${errorText || 'پاسخ نامشخص'}`,
      };
    }

    return { success: true, message: 'تراکنش با موفقیت ارسال شد.' };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'خطای شبکه در اتصال به سرویس مقصد',
    };
  }
}
