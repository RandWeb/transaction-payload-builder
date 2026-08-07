/** پارس کردن ایمن JSON بدون پرتاب خطا */
export function safeParseJson<T>(content: string): T | null {
  try {
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

/** فرمت‌بندی استاندارد برای نمایش */
export function formatJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}
