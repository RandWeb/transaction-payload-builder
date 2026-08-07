# FraudTransactionForge

ابزار فرانت‌اند برای واردکردن `transaction.json`، مدیریت Mapping خام `code -> sourceField`، ساخت Payload کددار، ارسال Mock/واقعی به `POST /transaction` و نگه‌داری Audit در SQLite داخل مرورگر.

## پیش‌نیازها

- Node.js نسخه `>=20 <25`
- npm مطابق `package-lock.json`
- مرورگر مدرن با پشتیبانی IndexedDB و WASM

## نصب و اجرا

```bash
npm install
npm run dev
```

برای خروجی production:

```bash
npm run build
npm run preview
```

## تنظیمات محیطی

از `.env.example` یک فایل `.env` بسازید:

```env
VITE_API_BASE_URL=http://ip
VITE_TRANSACTION_ENDPOINT=/transaction
VITE_USE_MOCK_API=true
VITE_REQUEST_TIMEOUT_MS=15000
VITE_APP_ENV=development
VITE_API_TOKEN=
```

توکن اختیاری است و فقط از env خوانده می‌شود.

## اسکریپت‌ها

- `npm run dev`: اجرای محیط توسعه
- `npm run build`: typecheck و ساخت production
- `npm run preview`: پیش‌نمایش build
- `npm run typecheck`: بررسی TypeScript
- `npm run lint`: بررسی ESLint
- `npm run test`: اجرای Vitest
- `npm run test:coverage`: اجرای coverage پس از نصب provider رسمی Vitest

## ساختار پوشه

- `src/app`: layout، route، provider و shell برنامه
- `src/pages`: صفحات lazy-loaded
- `src/features`: دامنه‌های Transaction، Mapping، Payload، Submission و Template
- `src/shared`: کامپوننت‌ها، API، DB، schemaها و ابزارهای مشترک
- `src/stores`: Zustand workspace state
- `src/test`: زیرساخت، تست‌های معماری و سناریوهای یکپارچه
- `docs`: قراردادها، راهنما و مستندات تحویل

## جریان اصلی

1. در صفحه میز کار، فایل یا متن JSON را مطابق `docs/transaction.json` وارد کنید.
2. Mapping فعال را در صفحه کدینگ بررسی یا نسخه جدید ذخیره کنید.
3. Payload را پیش‌نمایش بگیرید؛ داده‌های حساس در UI ماسک می‌شوند.
4. تراکنش را ارسال کنید؛ نتیجه و خطاها در تاریخچه Audit ثبت می‌شوند.
5. از تاریخچه برای Replay، مشاهده جزئیات یا Export استفاده کنید.

## اعتبارسنجی کیفیت

قبل از تحویل اجرا کنید:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## اسکرین‌شات

اسکرین‌شات نهایی باید بعد از اجرای `npm run preview` از مسیرهای `/workspace`، `/mappings`، `/history` و `/templates` تهیه و به مستندات تحویل ضمیمه شود.
