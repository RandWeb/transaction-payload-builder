# TASK 12 — پیش‌نمایش Payload و Diff Viewer

> ⚠️ رعایت کامل `../GLOBAL-RULES.md` الزامی است.

**پیش‌نیاز:** 11 · **خروجی:** نمایش شفاف Payload نهایی قبل از ارسال

---

## هدف
کاربر باید **قبل از ارسال** دقیقاً ببیند چه چیزی ارسال می‌شود، هر مقدار از کجا آمده، و چه چیزی حذف شده است.

## شرح کار

### ۱۲-۱ `PayloadPreview.tsx`
دو حالت نمایش (Tabs):
1. **حالت JSON** — با `JsonCodeEditor` فقط‌خواندنی، Syntax Highlight، شماره خط
2. **حالت جدول** — ستون‌ها: کد مقصد · برچسب فارسی · فیلد منبع · مقدار نهایی · Transform اعمال‌شده · منبع مقدار (Attribute/پیش‌فرض)

قابلیت‌ها:
- Badge بالای پنل: «۳۲ فیلد ارسال می‌شود · ۱۸ فیلد حذف شد · ۲ هشدار»
- نمایش نسخه Mapping فعال + زمان ساخت (شمسی، ۲۴ ساعته)
- سوییچ «نمایش مقادیر حساس» (پیش‌فرض: Mask شده §۱۰)
- نمایش حجم تقریبی Payload (بایت)
- حالت‌های `Loading` / `Empty` / `Error` با کامپوننت‌های مشترک

### ۱۲-۲ `PayloadValidationResult.tsx`
نمایش `BuildReport` به‌صورت سه بخش جمع‌شونده:
- ❌ **خطاها** — مسدودکننده‌ی ارسال؛ هر مورد قابل کلیک → پرش به فیلد در ادیتور
- ⚠️ **هشدارها** — مثل Attribute های نگاشت‌نشده
- ℹ️ **فیلدهای حذف‌شده** — با ذکر دلیل هر حذف

> دکمه «ارسال» تا زمان وجود خطای مسدودکننده **غیرفعال** باشد (با Tooltip توضیح دلیل).

### ۱۲-۳ `PayloadDiffViewer.tsx`
مقایسه‌ی دو Payload به‌صورت کنار‌هم (Side-by-Side) یا خطی:
- موارد کاربرد: مقایسه با آخرین ارسال موفق · مقایسه‌ی خروجی دو نسخه Mapping
- رنگ‌بندی: افزوده (سبز) · حذف‌شده (قرمز) · تغییرکرده (زرد) — **همراه با آیکون و متن** (§۱۱)
- پیاده‌سازی الگوریتم Diff ساده بر پایه‌ی کلید (چون Payload تخت است) — بدون کتابخانه‌ی خارجی
- در موبایل: حالت خطی (Unified) به‌جای Side-by-Side

### ۱۲-۴ `CopyPayloadButton.tsx`
- کپی Payload به Clipboard (Pretty یا Minified)
- کپی به‌صورت **دستور cURL آماده** (با URL از `env` و بدون افشای Token — Placeholder جایگزین شود)
- بازخورد «کپی شد» با Toast

### ۱۲-۵ `utils/payload-formatter.ts`
- `formatPayloadForDisplay(payload, options)` — Mask، مرتب‌سازی، تبدیل ارقام برای نمایش
- `estimatePayloadSize(payload): number`
- `buildCurlCommand(payload, config): string`
- `diffPayloads(a, b): PayloadDiff[]`

## اصلاحیه نمایش Unmapped و Payload نهایی

Preview باید قرارداد خروجی Task 11 را نمایش دهد:

- JSON preview باید payload flat را نشان دهد: `businessId`, `sysName`, `fraudMessageId`, `attrsList`.
- جدول preview باید برای هر مقدار mapped ستون‌های `attrsListIndex`، `fieldName`، `mappingCode` و مقدار نهایی را نشان دهد.
- مقدار نهایی باید همان `string` یا `string[]` خام باشد؛ نمایش UI می‌تواند formatted باشد اما copy/export payload نباید مقدار را تغییر دهد.
- `PayloadValidationResult` باید `unmappedFields` را به‌عنوان warning مستقل نشان دهد.
- هر unmapped warning باید نام field، index عضو `attrsList`، مقدار فعلی در صورت نیاز و پیام واضح مثل `Field "TransactionChannel" does not have a mapping code.` داشته باشد.
- وجود unmapped warning به‌تنهایی نباید دکمه ارسال را غیرفعال کند؛ فقط errors مسدودکننده ارسال را غیرفعال می‌کنند.
- Diff payload باید روی ساختار flat و کلیدهای کددار داخل `attrsList` کار کند.

## فایل‌های خروجی
```
src/features/payload/components/{PayloadPreview,PayloadDiffViewer,PayloadValidationResult,CopyPayloadButton}.tsx
src/features/payload/utils/payload-formatter.ts (+ payload-formatter.test.ts)
src/features/payload/hooks/usePayloadPreview.ts
```

## معیار پذیرش
- [ ] با تغییر تراکنش یا Mapping، پیش‌نمایش **بلافاصله** بروزرسانی می‌شود.
- [ ] شماره کارت به‌صورت پیش‌فرض Mask نمایش داده می‌شود.
- [ ] وجود خطای مسدودکننده → دکمه ارسال غیرفعال با Tooltip.
- [ ] کلیک روی خطا → پرش و Focus روی فیلد مربوطه در ادیتور.
- [ ] cURL کپی‌شده معتبر است و شامل هیچ Token واقعی نیست.
- [ ] Diff دو Payload متفاوت، تغییرات را درست تشخیص می‌دهد (تست واحد).
- [ ] در موبایل، Diff به حالت خطی تبدیل می‌شود.
- [ ] سایر بندهای DoD §۱۳.
