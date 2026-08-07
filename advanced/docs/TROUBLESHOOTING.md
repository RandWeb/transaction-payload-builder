# عیب‌یابی

## برنامه اجرا نمی‌شود

- نسخه Node را با `node --version` بررسی کنید؛ باید `>=20 <25` باشد.
- وابستگی‌ها را با `npm install` نصب کنید.
- `.env` را از روی `.env.example` بسازید.

## JSON تراکنش پذیرفته نمی‌شود

- ساختار باید دقیقاً شامل `mainTransaction` و `attrsList` باشد.
- `attrsList` باید آرایه‌ای از objectها باشد.
- برای نمونه معتبر، `docs/transaction.json` را ببینید.

## Mapping ذخیره نمی‌شود

- تعداد کلیدها باید دقیقاً ۵۰ باشد.
- کدها باید عددی و بین `951` تا `1000` باشند.
- نام فیلد منبع نباید تکراری باشد.
- فایل باید مشابه `docs/mapping.json` و بدون metadata باشد.

## ارسال تراکنش خطا می‌دهد

- در حالت Mock، سناریو از localStorage/env کنترل می‌شود.
- کد `400` یعنی Payload نامعتبر است.
- کد `404` یعنی endpoint پیدا نشده است.
- کد `500` یعنی خطای سرور شبیه‌سازی یا دریافت شده است.
- Timeout با `VITE_REQUEST_TIMEOUT_MS` تنظیم می‌شود.

## تاریخچه یا Template ذخیره نمی‌شود

- مرورگر باید IndexedDB و WASM را پشتیبانی کند.
- در حالت private/incognito ممکن است persistence محدود شود.
- Export فایل SQLite را به‌عنوان پشتیبان نگه دارید.

## خطای coverage

اگر `npm run test:coverage` پیام نبود `@vitest/coverage-v8` داد، provider رسمی Vitest نصب نشده است. طبق قوانین پروژه نصب dependency جدید باید با تأیید مالک پروژه انجام شود.
