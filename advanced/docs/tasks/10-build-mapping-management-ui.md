# TASK 10 — مدیریت Mapping (رابط کاربری)

> ⚠️ رعایت کامل `../GLOBAL-RULES.md` الزامی است.
> 🔴 وابسته به تأیید **Q3, Q6**.

**پیش‌نیاز:** 05, 07 · **خروجی:** صفحه‌ی کامل مدیریت `mapping.json`

---

## هدف
مدیریت جدول نگاشت «نام فیلد داخلی → کد مقصد (951–1000)» شامل مشاهده، ویرایش، Import، اعتبارسنجی و نسخه‌گذاری.

## شرح کار

### ۱۰-۱ `MappingTable.tsx`
ستون‌ها: کد مقصد · نام فیلد منبع · برچسب فارسی · نوع مقدار · الزامی · Transform · وضعیت
- مرتب‌سازی بر اساس کد و نام
- جستجوی زنده (Debounce 300ms)
- فیلتر: همه / الزامی / دارای Transform / بدون منبع
- Sticky Header + Virtualization در صورت عبور از ۲۰۰ ردیف
  > ⚠️ کتابخانه‌ی Virtualization نیاز به تأیید دارد (§۳)؛ در غیر این صورت **صفحه‌بندی** پیاده شود.
- در موبایل: تبدیل به Card List

### ۱۰-۲ `MappingEditor.tsx`
ویرایش یک فیلد Mapping در Dialog:
- انتخاب کد مقصد از **کدهای آزاد** (کدهای اشغال‌شده غیرفعال با توضیح)
- انتخاب `sourceField` با Autocomplete از Attribute های تراکنش فعلی
- انتخاب `transform` از Enum بسته + **پیش‌نمایش زنده‌ی نتیجه تبدیل** روی مقدار نمونه
- تنظیم `required` و `defaultValue`

### ۱۰-۳ `MappingImportDialog.tsx`
- Import فایل `mapping.json` (همان جریان امن تسک ۰۹)
- **نمایش Diff** با Mapping فعال: افزوده‌ها / حذف‌شده‌ها / تغییرکرده‌ها
- تعیین شماره نسخه‌ی جدید (پیشنهاد خودکار Semver: تغییر Breaking → Major)
- ذخیره در دیتابیس به‌عنوان نسخه‌ی جدید و امکان فعال‌سازی

### ۱۰-۴ `MappingValidationPanel.tsx`
نمایش زنده‌ی مشکلات:
| نوع | شدت |
|-----|-----|
| کد تکراری | خطا |
| کد خارج از بازه 951–1000 | خطا |
| `sourceField` تکراری | خطا |
| فیلد الزامی بدون مقدار در تراکنش فعلی | خطا |
| فیلد Mapping بدون Attribute متناظر | هشدار |
| Attribute بدون Mapping (ارسال نخواهد شد) | هشدار |
| کدهای استفاده‌نشده در بازه | اطلاع‌رسانی |

هر مورد قابل کلیک → پرش به ردیف مربوطه.

### ۱۰-۵ نسخه‌گذاری
- لیست نسخه‌ها با تاریخ شمسی و Badge «فعال»
- تغییر نسخه فعال با `ConfirmDialog` (چون Payload را تغییر می‌دهد)
- مشاهده Diff بین دو نسخه
- ⛔ حذف نسخه‌ای که در تاریخچه Audit استفاده شده **ممنوع** (یکپارچگی Audit)

## اصلاحیه نیازمندی Reverse Mapping

UI مدیریت Mapping باید قرارداد رسمی `mapping.json` را به‌صورت `code -> sourceField` نمایش و ویرایش کند، اما برای تحلیل وضعیت تراکنش از reverse lookup استفاده کند:

- جدول باید ستون‌های «کد Mapping» و «نام فیلد تراکنش» را واضح نشان دهد.
- Import فایل `mapping.json` باید فقط object خام `code -> sourceField` را بپذیرد.
- duplicate بودن `sourceField` باید خطای blocking باشد، چون reverse lookup را مبهم می‌کند.
- Validation panel باید برای هر field موجود در `attrsList` که کدی در Mapping ندارد، warning تولید کند.
- پیام warning باید شامل نام field و در صورت اتصال به تراکنش فعلی، index عضو `attrsList` باشد.
- UI نباید ادعا کند Mapping به‌صورت `fieldName -> code` ذخیره می‌شود؛ این فقط lookup داخلی Builder است.

## فایل‌های خروجی
```
src/features/mappings/components/{MappingTable,MappingEditor,MappingImportDialog,MappingValidationPanel,MappingVersionList,MappingDiffViewer}.tsx
src/pages/MappingsPage.tsx
src/features/mappings/hooks/{useMappings.ts,useActiveMapping.ts}
```

## معیار پذیرش
- [ ] لیست ۵۰ فیلد پیش‌فرض به‌درستی نمایش داده می‌شود.
- [ ] تلاش برای ثبت کد تکراری یا خارج از بازه → مسدود با پیام فارسی.
- [ ] Import یک Mapping جدید، Diff صحیح نشان می‌دهد و نسخه‌ی جدید می‌سازد.
- [ ] تغییر نسخه فعال، بلافاصله بر Payload تولیدی اثر می‌گذارد.
- [ ] حذف نسخه‌ی استفاده‌شده در Audit مسدود است.
- [ ] سایر بندهای DoD §۱۳.
