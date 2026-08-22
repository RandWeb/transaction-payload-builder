import type { OutputPayload } from '../types/transaction.types';

const DEFAULT_API_URL = 'http://ip/transaction';
const RUNTIME_CONFIG_URL = '/config.json';

interface RuntimeConfig {
  transactionApiUrl?: unknown;
  VITE_TRANSACTION_API_URL?: unknown;
}

function normalizeApiUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;

  const url = value.trim();
  return url === '' ? undefined : url;
}

/**
 * آدرس API را در زمان اجرای برنامه می‌خواند.
 *
 * فایل `public/config.json` بعد از build نیز در دسترس است و می‌توان آن را
 * روی سرور تغییر داد؛ بنابراین برای تغییر endpoint نیازی به build مجدد نیست.
 * مقدار env فقط fallback برای محیط‌هایی است که فایل runtime config ندارند.
 */
async function getTransactionApiUrl(): Promise<string> {
  try {
    const response = await fetch(`${RUNTIME_CONFIG_URL}?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      const config: unknown = await response.json();

      if (typeof config === 'object' && config !== null) {
        const runtimeConfig = config as RuntimeConfig;
        const runtimeUrl = normalizeApiUrl(
          runtimeConfig.transactionApiUrl ?? runtimeConfig.VITE_TRANSACTION_API_URL,
        );

        if (runtimeUrl) return runtimeUrl;
      }
    }
  } catch {
    // در صورت نبودن فایل تنظیمات، از مقدار build-time استفاده می‌شود.
  }

  return normalizeApiUrl(import.meta.env.VITE_TRANSACTION_API_URL) ?? DEFAULT_API_URL;
}

/** تولید نام فایل با تاریخ و زمان */
function generateTimestampFilename(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const y = now.getFullYear();
  const mo = pad(now.getMonth() + 1);
  const d = pad(now.getDate());
  const h = pad(now.getHours());
  const mi = pad(now.getMinutes());
  const s = pad(now.getSeconds());
  return `transaction-log_${y}-${mo}-${d}_${h}-${mi}-${s}.txt`;
}

/** ذخیره محتوای متنی به‌عنوان فایل txt در مرورگر */
function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** ارسال تراکنش تبدیل شده به API مقصد */
export async function submitTransaction(
  payload: OutputPayload,
): Promise<{ success: boolean; message: string }> {
  const requestBody = JSON.stringify(payload, null, 2);
  const timestamp = new Date().toISOString();
  const apiUrl = await getTransactionApiUrl();

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: requestBody,
    });

    const responseBody = await response.text();

    // ذخیره درخواست و پاسخ در فایل txt
    const logContent = [
      `=== Transaction Log ===`,
      `Timestamp: ${timestamp}`,
      `URL: ${apiUrl}`,
      ``,
      `--- REQUEST ---`,
      `Method: POST`,
      `Headers: { "Content-Type": "application/json", "Accept": "application/json" }`,
      `Body:`,
      requestBody,
      ``,
      `--- RESPONSE ---`,
      `Status: ${response.status}`,
      `Body:`,
      responseBody,
    ].join('\n');

    downloadTextFile(generateTimestampFilename(), logContent);

    if (!response.ok) {
      return {
        success: false,
        message: `خطای سرور (${response.status}): ${responseBody || 'پاسخ نامشخص'}`,
      };
    }

    return { success: true, message: 'تراکنش با موفقیت ارسال شد.' };
  } catch (err: unknown) {
    // ذخیره خطا نیز در فایل
    const errorMsg = err instanceof Error ? err.message : 'خطای شبکه در اتصال به سرویس مقصد';
    const logContent = [
      `=== Transaction Log (Error) ===`,
      `Timestamp: ${timestamp}`,
      `URL: ${apiUrl}`,
      ``,
      `--- REQUEST ---`,
      `Method: POST`,
      `Body:`,
      requestBody,
      ``,
      `--- ERROR ---`,
      errorMsg,
    ].join('\n');

    downloadTextFile(generateTimestampFilename(), logContent);

    return {
      success: false,
      message: errorMsg,
    };
  }
}
