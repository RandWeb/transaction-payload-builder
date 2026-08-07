# TASK 16 — تست‌های واحد و یکپارچه

> ⚠️ رعایت کامل `../GLOBAL-RULES.md` الزامی است (به‌ویژه §۱۲).

**پیش‌نیاز:** 08–15 · **خروجی:** پوشش تست کامل و پایدار

---

## هدف
تضمین صحت منطق حیاتی و جریان End-to-End با **Vitest** (تنها ابزار تست مجاز طبق Stack قفل‌شده).

## شرح کار

### ۱۶-۱ زیرساخت تست
- `src/test/setup.ts` — پیکربندی RTL، Cleanup خودکار، Mock کردن `matchMedia` و `IndexedDB`
- `src/test/factories/` — سازنده‌ی داده‌ی تستی: `makeTransaction()`, `makeMapping()`, `makeSubmission()` با امکان Override جزئی
- `src/test/utils/renderWithProviders.tsx` — رندر با تمام Provider ها (Theme, Query, Router)
- `src/test/mocks/db.ts` — دیتابیس درون‌حافظه‌ای برای تست Repository

### ۱۶-۲ تست‌های واحد (اولویت بالا)
| هدف | حداقل پوشش |
|-----|-------------|
| `features/mappings/engine/**` | **۹۰٪** |
| `shared/lib/{format,json,cn}` | ۹۰٪ |
| `transaction-normalizer` | ۹۰٪ |
| Zod Schemas | ۹۰٪ |
| `shared/api/{http-client,api-error}` | ۸۰٪ |
| `stores/**` | ۸۰٪ |
| `shared/db/repositories/**` | ۷۰٪ |

### ۱۶-۳ تست‌های کامپوننت
- `TransactionAttributeForm` — افزودن/ویرایش/خطای اعتبارسنجی
- `MappingEditor` — جلوگیری از کد تکراری/خارج از بازه
- `PayloadPreview` — نمایش صحیح، Mask، بروزرسانی با تغییر ورودی
- `SubmitTransactionButton` — غیرفعال بودن هنگام خطا، Double-Submit Guard
- `Dialog` و `ErrorAlert` — رفتار a11y و کیبورد

### ۱۶-۴ تست‌های یکپارچه (سناریوی کامل)
| # | سناریو |
|---|--------|
| 1 | Import `transaction.json` → اعتبارسنجی → ساخت Payload → ارسال موفق → ثبت در تاریخچه |
| 2 | تراکنش با فیلد الزامی خالی → مسدود شدن ارسال + پیام فارسی |
| 3 | تغییر نسخه Mapping → تغییر Payload → ثبت نسخه صحیح در Audit |
| 4 | خطای سرور (۵۰۰) → ثبت خطا در تاریخچه + امکان تلاش مجدد |
| 5 | Timeout → پیام فارسی + رکورد ناموفق بدون `pending` سرگردان |
| 6 | ذخیره Template → بارگذاری → ساخت همان Payload |
| 7 | Replay از تاریخچه → پر شدن صحیح میز کار |

### ۱۶-۵ تست‌های ساختاری (Architecture Tests)
- `engine` نباید به `react` یا `stores` وابسته باشد.
- `shared` نباید به `features` وابسته باشد.
- هیچ فایلی نباید `any` یا `@ts-ignore` داشته باشد.
- هیچ رنگ Hex خارج از `index.css` وجود نداشته باشد.

### ۱۶-۶ گزارش پوشش
- `npm run test:coverage` با Threshold های بالا در `vitest.config.ts` → **شکست Build در صورت افت پوشش**

## اصلاحیه تست‌های Payload Builder

سناریوهای تست باید قرارداد جدید را پوشش دهند:

- paste و import فایل `transaction.json` باید با pipeline مشترک validate شوند.
- مقدارهای نامعتبر در `attrsList` مثل number, boolean, object و null باید رد شوند.
- Builder باید از Mapping خام `code -> sourceField` reverse lookup بسازد.
- نمونه `TrxChannel -> 976`, `TrxAmount -> 996`, `TrxDate -> 999` باید تست شود.
- مقدار آرایه‌ای مثل `["paya", "satna"]` باید بدون تغییر در payload باقی بماند.
- هیچ تبدیل عددی یا تاریخی نباید انجام شود؛ مقدار `"2024-10-21 16:53:22.11"` باید دقیقاً همان بماند.
- فیلد unmapped باید از payload حذف و در report با `fieldName`, `attrsListIndex`, `value`, `message` ثبت شود.
- وجود unmapped field باید warning باشد و مسیر ارسال را فقط در صورت نبود error مسدود نکند.
- سناریوی integration باید مسیر کامل import/paste → validation → reverse mapping → preview warning → payload قابل ارسال به `POST /transaction` را پوشش دهد.

## فایل‌های خروجی
```
src/test/{setup.ts,factories/*,utils/*,mocks/*}
src/test/integration/*.test.tsx
src/test/architecture/*.test.ts
vitest.config.ts (بروزرسانی Threshold)
```

## معیار پذیرش
- [ ] `npm run test` کاملاً سبز و بدون تست ناپایدار (Flaky).
- [ ] پوشش `engine` ≥ ۹۰٪ و سایر منطق‌ها ≥ ۷۰٪.
- [ ] هیچ تستی به شبکه‌ی واقعی وابسته نیست.
- [ ] هر ۷ سناریوی یکپارچه پاس می‌شوند.
- [ ] تست‌های ساختاری فعال و پاس هستند.
- [ ] نام تست‌ها فارسی و طبق قرارداد §۱۲.
- [ ] سایر بندهای DoD §۱۳.
