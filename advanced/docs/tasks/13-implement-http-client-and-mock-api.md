# TASK 13 — HTTP Client و Mock API

> ⚠️ رعایت کامل `../GLOBAL-RULES.md` الزامی است.
> 🔴 وابسته به تأیید **Q4, Q9**.

**پیش‌نیاز:** 01, 05 · **خروجی:** لایه ارتباطی امن + سرویس آزمایشی

---

## هدف
ساخت لایه‌ی HTTP بر پایه‌ی **Fetch API** (طبق Stack قفل‌شده) و یک **Mock API** کامل، چون به API واقعی دسترسی نداریم (§۲.۱۵).

## شرح کار

### ۱۳-۱ `shared/api/api-error.ts`
```ts
class AppError extends Error {
  code: AppErrorCode;        // VALIDATION | MAPPING | NETWORK | SERVER | STORAGE | UNKNOWN
  messageFa: string;         // پیام فارسی قابل نمایش به کاربر
  httpStatus?: number;
  details?: unknown;
  cause?: unknown;
  traceId?: string;          // برای پیگیری در تاریخچه Audit
}
```
- سازنده‌های کمکی: `AppError.network()`, `AppError.server()`, `AppError.validation()`, `AppError.storage()`, `AppError.from(unknown)`
- تابع `toUserMessage(error): string` — تضمین اینکه هیچ متن انگلیسی خام به کاربر نرسد (§۸.۶)

### ۱۳-۲ `shared/api/http-client.ts`
پیاده‌سازی Wrapper روی `fetch` با قابلیت‌های:
- Base URL از `config/env.ts` (⛔ بدون Hard-code §۱۰)
- **Timeout** با `AbortController` (مقدار از `VITE_REQUEST_TIMEOUT_MS`)
- **Retry** فقط برای خطاهای شبکه و `5xx` (حداکثر ۱ بار، با Backoff) — ⛔ بدون Retry روی `4xx`
- Header خودکار: `Content-Type: application/json`, `X-Request-Id` (UUID برای Audit)
- تزریق Token از `env` **فقط اگر تعریف شده باشد** (نتیجه Q9)
- اندازه‌گیری `durationMs` برای هر درخواست
- **Parse پاسخ با Zod** (⛔ بدون Type Assertion §۷)
- خروجی همه متدها: `Promise<Result<T, AppError>>`
- تبدیل تمام حالت‌ها به `AppError`: قطع شبکه، Timeout، CORS، پاسخ غیر JSON، `5xx`، `4xx`
- **Interceptor ساده** برای لاگ در حالت Development (⛔ بدون `console.log` در Production)

### ۱۳-۳ Mock API — `shared/api/mock/`
سوییچ با `VITE_USE_MOCK_API=true`:
- `mock-server.ts` — رهگیری درخواست‌ها به `POST /transaction` بدون کتابخانه‌ی خارجی (پیاده‌سازی داخلی در لایه http-client)
  > ⚠️ افزودن MSW نیاز به تأیید دارد (§۳). راهکار پیش‌فرض: Adapter داخلی.
- سناریوهای قابل انتخاب از **صفحه تنظیمات**:
  | سناریو | رفتار |
  |--------|-------|
  | `success` | پاسخ ۲۰۰ با `referenceId` تصادفی |
  | `validation-error` | پاسخ ۴۰۰ با لیست خطای فیلدها |
  | `server-error` | پاسخ ۵۰۰ |
  | `timeout` | عدم پاسخ تا سررسید Timeout |
  | `network-error` | شکست اتصال |
  | `slow` | پاسخ موفق با تأخیر ۵ ثانیه (تست UI Loading) |
- تأخیر تصادفی قابل تنظیم (۲۰۰–۸۰۰ms) برای واقع‌گرایی

### ۱۳-۴ `features/submissions/api/transaction-api.ts`
```ts
submitTransaction(payload, meta): Promise<Result<SubmissionResponse, AppError>>
```
- مسیر از `VITE_TRANSACTION_ENDPOINT` (پیش‌فرض `/transaction`)
- اعتبارسنجی پاسخ با `submissionResponseSchema`

### ۱۳-۵ نمایش وضعیت
کامپوننت `ApiStatusBadge` (از تسک ۰۴) وضعیت را نشان دهد: «Mock فعال» یا «اتصال واقعی» + آدرس Base URL.

## فایل‌های خروجی
```
src/shared/api/{http-client.ts,api-error.ts,request-id.ts}
src/shared/api/mock/{mock-server.ts,mock-scenarios.ts,mock-data.ts}
src/features/submissions/api/transaction-api.ts
src/features/submissions/types/submission.types.ts (تکمیل)
+ تست‌های http-client و api-error
```

## معیار پذیرش
- [ ] با `VITE_USE_MOCK_API=true` ارسال کار می‌کند و پاسخ Mock برمی‌گردد.
- [ ] هر ۶ سناریوی Mock به‌درستی شبیه‌سازی می‌شوند.
- [ ] Timeout پس از مدت تعیین‌شده، `AppError` با کد `NETWORK` و پیام فارسی می‌دهد.
- [ ] خطای `4xx` **Retry نمی‌شود**؛ خطای `5xx` یک بار Retry می‌شود.
- [ ] پاسخ با ساختار نامعتبر → خطای `VALIDATION` (نه Crash).
- [ ] هیچ URL یا Token در کد Hard-code نشده (بررسی با `grep`).
- [ ] `X-Request-Id` در هر درخواست یکتاست و در Audit ذخیره می‌شود.
- [ ] تست‌ها بدون شبکه واقعی سبز هستند (§۱۲).
- [ ] سایر بندهای DoD §۱۳.

## ثبت در DECISIONS.md
- دلیل Fetch + Wrapper به‌جای axios.
- سیاست Retry و Timeout.
- دلیل Mock داخلی به‌جای MSW.