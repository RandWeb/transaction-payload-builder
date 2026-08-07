
# TASKS INDEX — FraudTransactionForge

> ⚠️ رعایت کامل `../GLOBAL-RULES.md` در **همه‌ی** تسک‌ها الزامی است.
> ⚠️ شروع تسک ۰۶ مشروط به پاسخ **Q1** در `../OPEN-QUESTIONS.md` است.

| # | تسک | فایل | پیش‌نیاز | مسیر بحرانی |
|---|-----|------|----------|-------------|
| 01 | راه‌اندازی پروژه و ابزارها | `01-setup-project-and-tooling.md` | — | ✅ |
| 02 | ساخت Design System و Theme | `02-build-design-system-and-theme.md` | 01 | ✅ |
| 03 | ساخت کامپوننت‌های مشترک UI | `03-build-shared-ui-components.md` | 02 | ✅ |
| 04 | App Shell، Routing و Layouts | `04-setup-app-shell-routing-and-layouts.md` | 03 | ✅ |
| 05 | تایپ‌های دامنه و اسکیماهای Zod | `05-define-domain-types-and-zod-schemas.md` | 01 | ✅ |
| 06 | لایه دیتابیس SQLite محلی | `06-implement-local-sqlite-database-layer.md` | 05 + Q1 | ✅ |
| 07 | Workspace Store (Zustand) | `07-implement-workspace-store.md` | 05, 06 | ✅ |
| 08 | ادیتور تراکنش | `08-build-transaction-editor.md` | 03, 05, 07 | ✅ |
| 09 | Import/Export تراکنش (JSON) | `09-implement-transaction-json-import-export.md` | 08 | |
| 10 | مدیریت Mapping (UI) | `10-build-mapping-management-ui.md` | 05, 07 | ✅ |
| 11 | موتور Mapping و Payload Builder | `11-implement-mapping-engine-and-payload-builder.md` | 05, 10 | ✅ |
| 12 | پیش‌نمایش Payload و Diff | `12-build-payload-preview-and-diff-viewer.md` | 11 | |
| 13 | HTTP Client و Mock API | `13-implement-http-client-and-mock-api.md` | 01, 05 | ✅ |
| 14 | ارسال تراکنش و تاریخچه Audit | `14-implement-transaction-submission-and-audit-history.md` | 11, 13, 06 | ✅ |
| 15 | مدیریت Template ها | `15-implement-templates-management.md` | 06, 08 | |
| 16 | تست‌های واحد و یکپارچه | `16-write-unit-and-integration-tests.md` | 08–15 | ✅ |
| 17 | نهایی‌سازی Responsive/a11y/مستندات | `17-finalize-responsive-a11y-and-documentation.md` | همه | ✅ |

## ترتیب اجرای پیشنهادی
`01 → 02 → 03 → 05 → 04 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 → 14 → 15 → 16 → 17`

جواب برخی ابهامات برای شروع پروژه
Q1 — تناقض «SQLite» با پروژه‌ی Frontend-only 🔴 بلوکه‌کننده

در مستند، دیتابیس sqlite ذکر شده اما «کل پروژه فرانت است».

پیشنهاد من (گزینه A): استفاده از SQLite کامپایل‌شده به WASM (sql.js یا wa-sqlite) داخل مرورگر، با ذخیره‌سازی فایل دیتابیس در IndexedDB و امکان Export/Import فایل .sqlite.





✅ واقعاً SQLite است، SQL می‌نویسیم، Audit پایدار می‌ماند، فایل قابل انتقال است.



Q2 — ساختار دقیق transaction.json

ساختار پیشنهادی من:

{
  "transactionId": "TRX-1405-0001",
  "transactionType": "CARD_TO_CARD",
  "occurredAt": "1405/05/12 14:32:10",
  "amount": 1500000,
  "currency": "IRR",
  "channel": "MOBILE",
  "attributes": [
    { "name": "sourceCardNumber", "value": "6037991122334455", "type": "string" },
    { "name": "destinationCardNumber", "value": "6104337788990011", "type": "string" },
    { "name": "customerNationalCode", "value": "0079988776", "type": "string" },
    { "name": "deviceId", "value": "AND-9f2c", "type": "string" },
    { "name": "isFirstTransfer", "value": true, "type": "boolean" }
  ]
}

❓ فایل نمونه‌ی واقعی transaction.json را دارید؟ آیا attributes آرایه است یا Object تخت؟



Q3 — ساختار دقیق mapping.json

دقیقا به همین نام وجود دارد وهیچ تغییری نباید کند



Q4 — قرارداد API مقصد (POST /transaction)

کرل نمونه دقیقا به نام curl.txt وجود دارد 
کدهای استاندارد هم 200 و 400 و 404 و 500



Q5 — سیاست فیلدهای بدون مقدار

❓ اگر فیلد مقدار نداشت: حذف از payload / ارسال null / ارسال "" / استفاده از defaultValue؟
 اگر required باشد → خطای Validation؛ در غیر این صورت اگر defaultValue بود از آن استفاده شود، وگرنه فیلد از payload حذف شود.



Q6 — دامنه‌ی مدیریت Mapping

❓ آیا کاربر می‌تواند Mapping را در UI ویرایش و نسخه‌گذاری کند، یا فقط mapping.json را Import کند؟
خیر نمی تواند فایل مپنیگ را در ui ویرایش مند و فقط از همین فایل داده ها خوانده می شود و هیچ تغییری نمی کند



Q7 — تولید داده‌ی Fake

مستند می‌گوید «کار با داده‌های فیک» ولی در نیازمندی‌ها ابزار تولید داده تعریف نشده.
❓ آیا قابلیت «تولید مقدار خودکار/تصادفی برای پارامترها» (مثل شماره کارت معتبر Luhn، کد ملی معتبر) جزو Scope است؟
خیر اضافه نکن



Q8 — تبدیل تاریخ در Payload

❓ تاریخ در payload خروجی شمسی بماند یا به میلادی/ISO-8601 تبدیل شود؟
تاریخ میلادی باشد



Q9 — احراز هویت سرویس مقصد

❓ آیا API مقصد Token/Basic Auth می‌خواهد؟  Basic Auth می خواهد یعنی نام کاربری و پسورد داریم



Q10 — سقف نگه‌داری Audit

❓ چند رکورد Submission نگه داشته شود؟
 حداکثر ۱۰۰۰ رکورد + امکان Export به JSON/CSV + دکمه پاک‌سازی.
---

## اصلاحیه قطعی Payload و Mapping

این اصلاحیه بر پاسخ‌های قدیمی Q2, Q3, Q4, Q5 و Q8 در همین فایل اولویت دارد:

- `transaction.json` ورودی ریشه‌ی `mainTransaction` دارد و شامل `businessId`, `sysName`, `fraudMessageId`, `attrsList` است.
- `attrsList` آرایه‌ای از objectهاست؛ هر مقدار فقط `string` یا `string[]` است.
- `mapping.json` رسمی پروژه object خام `mappingCode -> fieldName` است.
- ساخت payload با reverse lookup انجام می‌شود: `fieldName -> mappingCode`.
- payload نهایی برای `POST /transaction` ریشه‌ی flat دارد: `businessId`, `sysName`, `fraudMessageId`, `attrsList`.
- Builder هیچ تبدیل عددی، boolean، تاریخی، Jalali/ISO یا trim اجباری انجام نمی‌دهد.
- مقدار آرایه‌ای بدون تغییر مقدار و ترتیب حفظ می‌شود.
- فیلدهای unmapped در payload ارسال نمی‌شوند و به‌عنوان warning با `fieldName`, `attrsListIndex`, `value`, `message` گزارش می‌شوند.
