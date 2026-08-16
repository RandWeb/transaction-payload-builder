import type { OutputPayload } from "../types/transaction.types";

const transactionApiUrl: unknown = import.meta.env.VITE_TRANSACTION_API_URL;

const API_URL =
  typeof transactionApiUrl === "string" && transactionApiUrl.trim() !== ""
    ? transactionApiUrl
    : "http://ip/transaction";

/** تولید نام فایل با تاریخ و زمان */
function generateTimestampFilename(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
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
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
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

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: requestBody,
    });

    const responseBody = await response.text();

    // ذخیره درخواست و پاسخ در فایل txt
    const logContent = [
      `=== Transaction Log ===`,
      `Timestamp: ${timestamp}`,
      `URL: ${API_URL}`,
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
    ].join("\n");

    downloadTextFile(generateTimestampFilename(), logContent);

    if (!response.ok) {
      return {
        success: false,
        message: `خطای سرور (${response.status}): ${responseBody || "پاسخ نامشخص"}`,
      };
    }

    return { success: true, message: "تراکنش با موفقیت ارسال شد." };
  } catch (err: unknown) {
    // ذخیره خطا نیز در فایل
    const errorMsg = err instanceof Error ? err.message : "خطای شبکه در اتصال به سرویس مقصد";
    const logContent = [
      `=== Transaction Log (Error) ===`,
      `Timestamp: ${timestamp}`,
      `URL: ${API_URL}`,
      ``,
      `--- REQUEST ---`,
      `Method: POST`,
      `Body:`,
      requestBody,
      ``,
      `--- ERROR ---`,
      errorMsg,
    ].join("\n");

    downloadTextFile(generateTimestampFilename(), logContent);

    return {
      success: false,
      message: errorMsg,
    };
  }
}
