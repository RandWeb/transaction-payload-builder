# TASK 11 — موتور Mapping و Payload Builder

> ⚠️ رعایت کامل `../GLOBAL-RULES.md` الزامی است.
> ⭐ این تسک فقط قرارداد و معیارهای پیاده‌سازی را تعریف می‌کند؛ در این مرحله هیچ کد implementation نوشته نشود.

**پیش‌نیاز:** 05, 09, 10 · **خروجی:** تبدیل `transaction.json` معتبر به payload قابل ارسال به `POST /transaction`

---

## هدف
ساخت یک موتور Pure برای تبدیل تراکنش ورودی به payload نهایی با استفاده از `mapping.json`.

ورودی‌ها:
- `transaction.json` با ریشه‌ی `mainTransaction`
- `mapping.json` به شکل خام `code -> sourceField`

خروجی:
- payload نهایی با انتقال مستقیم `businessId`، `sysName` و `fraudMessageId`
- تبدیل هر object داخل `attrsList` به object کددار
- گزارش کامل فیلدهای unmapped

---

## قرارداد قطعی Mapping

ساختار Mapping در `docs/mapping.json` و Mappingهای import شده باید به این شکل باشد:

```json
{
  "996": "TrxAmount",
  "976": "TrxChannel",
  "999": "TrxDate",
  "958": "TrxFraudMessageId"
}
```

قاعده‌ی کلیدی:
- Mapping در فایل به‌صورت `mappingCode -> fieldName` ذخیره می‌شود.
- Payload Builder باید برای تبدیل `attrsList` از reverse lookup استفاده کند: `fieldName -> mappingCode`.
- مثال: `TrxChannel -> 976`، `TrxAmount -> 996`، `TrxDate -> 999`.
- اگر چند کد به یک field name اشاره کنند، Mapping نامعتبر است و Builder نباید payload بسازد.

---

## قرارداد قطعی Payload

ساختار نهایی payload باید flat و آماده‌ی ارسال به API باشد:

```json
{
  "businessId": "PASSARGAD",
  "sysName": "CORE",
  "fraudMessageId": "1403082116532207730195",
  "attrsList": [
    {
      "976": "paya",
      "996": "124000000",
      "999": "2024-10-21 16:53:22.11"
    },
    {
      "976": ["paya", "satna"],
      "996": "100000000"
    }
  ]
}
```

قواعد:
- `businessId`، `sysName` و `fraudMessageId` بدون تغییر نام و بدون تغییر مقدار از `mainTransaction` منتقل می‌شوند.
- `attrsList` آرایه‌ای از objectها باقی می‌ماند.
- فقط کلیدهای داخل هر عضو `attrsList` که در reverse mapping وجود دارند، به کد عددی تبدیل می‌شوند.
- مقدار فیلدها فقط `string` یا `array of string` است.
- هیچ type conversion عددی، بولی، تاریخی، Jalali/ISO یا trim اجباری در Builder انجام نشود.
- آرایه‌ها بدون تغییر ترتیب و مقدار حفظ شوند؛ فقط نام کلید تبدیل شود.
- ترتیب کلیدهای هر payload leg برای تست و diff باید deterministic باشد؛ پیشنهاد: ترتیب صعودی عددی کدها.

---

## نمونه تبدیل

ورودی leg:

```json
{
  "TrxChannel": "paya",
  "TrxAmount": "124000000"
}
```

خروجی leg:

```json
{
  "976": "paya",
  "996": "124000000"
}
```

ورودی با مقدار آرایه:

```json
{
  "TrxChannel": ["paya", "satna"]
}
```

خروجی:

```json
{
  "976": ["paya", "satna"]
}
```

---

## گزارش Unmapped Fields

اگر در یکی از objectهای `attrsList` فیلدی وجود داشته باشد که در `mapping.json` هیچ کدی برای آن وجود ندارد، آن فیلد نباید در payload نهایی ارسال شود و باید در report بیاید.

حداقل اطلاعات هر مورد:
- `fieldName`: نام فیلد
- `attrsListIndex`: index آیتم داخل `attrsList`
- `value`: مقدار فعلی فیلد، در صورت نیاز برای نمایش/debug
- `message`: پیام واضح انگلیسی یا فارسی

نمونه پیام:

```text
Field "TransactionChannel" does not have a mapping code.
```

این موارد warning هستند، نه خطای مسدودکننده؛ مگر اینکه محصول بعداً صراحتاً فیلد unmapped را blocking اعلام کند.

---

## مسئولیت فایل‌ها

### ۱۱-۱ `mapping-reverse-lookup`
- ساخت reverse lookup از Mapping خام.
- تشخیص duplicate source field.
- تشخیص کد نامعتبر یا مقدار غیررشته‌ای در Mapping.
- تضمین عدم mutation روی Mapping ورودی.

### ۱۱-۲ `payload-builder`
- validate کردن ساختار transaction قبل از تبدیل.
- validate کردن Mapping قبل از تبدیل.
- انتقال headerهای `businessId`، `sysName` و `fraudMessageId`.
- پیمایش همه‌ی اعضای `attrsList` بر اساس index.
- تبدیل کلیدها با reverse lookup.
- حفظ مقدارهای `string` و `string[]` بدون تغییر.
- تولید report شامل mapped fields و unmapped fields.

### ۱۱-۳ `mapping-validator`
- اعتبارسنجی ساختار `code -> sourceField`.
- رد کردن کدهای تکراری یا خارج از قرارداد مقصد.
- رد کردن source field تکراری.
- گزارش fieldهای تراکنش که در Mapping موجود نیستند به‌عنوان warning.

### ۱۱-۴ اتصال به Store
- Store فقط موتور را صدا بزند و نتیجه را ذخیره کند.
- هیچ منطق تبدیل داخل React component یا Store نوشته نشود.
- report تولیدشده باید برای task 12 قابل نمایش باشد.

---

## خروجی Build Report

Report باید حداقل این بخش‌ها را داشته باشد:

- `mappedFields`: فیلدهایی که با موفقیت تبدیل شده‌اند، شامل `fieldName`، `mappingCode`، `attrsListIndex` و مقدار نهایی.
- `unmappedFields`: فیلدهایی که کد Mapping ندارند، شامل `fieldName`، `attrsListIndex`، `value` و `message`.
- `errors`: خطاهای مسدودکننده مثل JSON/transaction/mapping نامعتبر.
- `warnings`: هشدارهای غیرمسدودکننده مثل unmapped field.

---

## فایل‌های خروجی پیشنهادی

```text
src/features/mappings/engine/mapping-reverse-lookup.ts
src/features/mappings/engine/mapping-validator.ts
src/features/mappings/engine/payload-builder.ts
src/features/mappings/engine/index.ts
src/features/mappings/types/build-report.types.ts
src/stores/slices/payload.slice.ts (بروزرسانی اتصال، بدون منطق تبدیل)
```

---

## معیار پذیرش

- [ ] Builder از Mapping خام `code -> sourceField` یک reverse lookup معتبر `fieldName -> code` می‌سازد.
- [ ] `TrxChannel`, `TrxAmount`, `TrxDate` به‌ترتیب به `976`, `996`, `999` تبدیل می‌شوند.
- [ ] مقدارهای `string` بدون تغییر و مقدارهای `string[]` بدون تغییر حفظ می‌شوند.
- [ ] هیچ تبدیل عددی، تاریخی، boolean، Jalali/ISO یا normalization محتوایی روی مقدارها انجام نمی‌شود.
- [ ] headerهای `businessId`، `sysName` و `fraudMessageId` با همان نام در ریشه‌ی payload نهایی قرار می‌گیرند.
- [ ] هر عضو `attrsList` به object کددار قابل ارسال به `POST /transaction` تبدیل می‌شود.
- [ ] فیلد unmapped در payload حذف و در `unmappedFields` با `fieldName`، `attrsListIndex`، `value` و پیام واضح گزارش می‌شود.
- [ ] فیلد unmapped warning است و به‌تنهایی مانع ساخت payload نمی‌شود.
- [ ] Mapping با source field تکراری یا کد نامعتبر باعث `Result.error` می‌شود.
- [ ] اجرای دوباره Builder با ورودی یکسان خروجی کاملاً یکسان تولید می‌کند.
- [ ] ورودی‌های `transaction` و `mapping` mutate نمی‌شوند.
- [ ] تست‌های واحد سناریوهای نمونه‌ی `docs/transaction.json` و `docs/mapping.json` را پوشش می‌دهند.
- [ ] هیچ import از `react` یا Store داخل پوشه‌ی `engine` وجود ندارد.

---

## تصمیم‌های لازم برای ثبت در `DECISIONS.md`

- Mapping رسمی پروژه به‌صورت `code -> sourceField` ذخیره می‌شود.
- Builder برای تبدیل payload همیشه reverse lookup می‌سازد.
- Payload نهایی ریشه‌ی flat دارد: `businessId`, `sysName`, `fraudMessageId`, `attrsList`.
- Builder هیچ type conversion انجام نمی‌دهد؛ مقدارها فقط pass-through هستند.
- Unmapped fieldها warning و قابل نمایش در UI هستند.
