# TASK 09 — Import و Export تراکنش (JSON)

> ⚠️ رعایت کامل `../GLOBAL-RULES.md` الزامی است.

**پیش‌نیاز:** 08 · **خروجی:** ورود/خروج `transaction.json`

---

## هدف
امکان آپلود/چسباندن `transaction.json` و خروجی گرفتن از تراکنش فعلی (مطابق هدف §۱: «وارد/آپلود/ویرایش»).

## شرح کار

### ۹-۱ `TransactionJsonImport.tsx`
سه روش ورود:
1. **Drag & Drop فایل** (با ناحیه‌ی مشخص و بازخورد بصری)
2. **انتخاب فایل** (`accept=".json,application/json"`)
3. **Paste متن JSON** در `JsonCodeEditor`

مراحل پردازش (هرکدام با پیام خطای فارسی مجزا):
1. بررسی پسوند و **حجم فایل** (سقف از `app-config.ts`)
2. خواندن فایل (`FileReader`) با مدیریت خطا
3. `JSON.parse` → خطای Syntax با **شماره خط/ستون**
4. `transactionSchema.safeParse` → لیست کامل خطاها با مسیر فیلد (`attributes[3].value`)
5. **Preview قبل از اعمال**: نمایش خلاصه (تعداد فیلد، فیلدهای ناشناخته، فیلدهای گمشده)
6. اگر پیش‌نویس فعلی `isDirty` بود → `ConfirmDialog` قبل از جایگزینی

قابلیت **Import جزئی**: امکان انتخاب اینکه فقط Attribute ها Import شوند یا کل تراکنش.

### ۹-۲ `TransactionJsonExport.tsx`
- پیش‌نمایش JSON نهایی با `JsonCodeEditor` (فقط‌خواندنی)
- دکمه‌ی **کپی** و دکمه‌ی **دانلود**
- نام فایل: `transaction-{transactionId}-{jalaliDateTime}.json`
- گزینه‌ی «خروجی با فرمت خوانا (Pretty)» / «فشرده (Minified)»
- گزینه‌ی «حذف فیلدهای خالی هنگام خروجی»

### ۹-۳ ابزار مشترک
`shared/lib/json.ts`:
- `safeJsonParse(text): Result<unknown, AppError>` با استخراج موقعیت خطا
- `prettyJson(value, indent)` / `minifyJson(value)`
- `downloadJson(value, filename)`
- `getJsonErrorPosition(text, error)` → `{ line, column }`

## فایل‌های خروجی
```
src/features/transactions/components/{TransactionJsonImport,TransactionJsonExport}.tsx
src/shared/lib/json.ts (+ json.test.ts)
src/shared/components/FileDropzone.tsx
```

## اصلاحیه نیازمندی Import/Paste

ورود JSON باید با قرارداد جدید هماهنگ باشد:

- کاربر می‌تواند `transaction.json` را از طریق paste متن JSON یا import فایل JSON وارد کند.
- هر دو مسیر paste و file import باید یک pipeline اعتبارسنجی مشترک داشته باشند.
- ساختار ریشه باید دقیقاً شامل `mainTransaction` باشد.
- `mainTransaction.businessId`، `mainTransaction.sysName` و `mainTransaction.fraudMessageId` باید validate و بدون تغییر در store ذخیره شوند.
- `mainTransaction.attrsList` باید آرایه‌ای غیرخالی از objectها باشد.
- مقدار هر field در هر عضو `attrsList` فقط `string` یا `array of string` است؛ مقدارهای number, boolean, object, null باید خطای validation بگیرند.
- مقدار آرایه‌ای مثل `"TrxChannel": ["paya", "satna"]` باید بدون تغییر مقدار و ترتیب پذیرفته شود.
- Import/Paste نباید کلیدها را به کد Mapping تبدیل کند؛ تبدیل فقط وظیفه Task 11 است.
- Preview قبل از اعمال باید تعداد آیتم‌های `attrsList`، فیلدهای قابل mapping و فیلدهای unmapped احتمالی را بر اساس Mapping فعال نشان دهد.
- خطاهای validation باید مسیر دقیق داشته باشند؛ نمونه: `mainTransaction.attrsList[1].TrxAmount`.

## معیار پذیرش
- [ ] Import فایل معتبر → فرم به‌درستی پر می‌شود.
- [ ] JSON خراب → پیام فارسی با شماره خط.
- [ ] فایل با پسوند اشتباه یا حجم زیاد → رد شدن با پیام مشخص.
- [ ] Export → دانلود فایل با نام صحیح شمسی و محتوای قابل Import مجدد (**Round-trip موفق**).
- [ ] Drag & Drop روی موبایل نیز جایگزین (دکمه انتخاب فایل) دارد.
- [ ] سایر بندهای DoD §۱۳.
