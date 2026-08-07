# TASK 15 — مدیریت Template ها

> ⚠️ رعایت کامل `../GLOBAL-RULES.md` الزامی است.

**پیش‌نیاز:** 06, 08 · **خروجی:** ذخیره و بارگذاری سناریوهای تراکنش

---

## هدف
تسترها باید بتوانند سناریوهای پرتکرار (مثلاً «کارت‌به‌کارت مشکوک») را ذخیره و با یک کلیک بارگذاری کنند.

## شرح کار

### ۱۵-۱ `api/templates-api.ts`
لایه‌ی نازک روی `template.repository.ts` (تسک ۰۶): `list`, `getById`, `create`, `update`, `remove`, `duplicate`
- همه با `Result` و اعتبارسنجی Zod

### ۱۵-۲ `SaveTemplateDialog.tsx`
- ورودی: نام (الزامی، **یکتا**) + توضیح (اختیاری)
- بررسی زنده‌ی تکراری‌بودن نام با Debounce
- در صورت نام تکراری → پیشنهاد «بروزرسانی قالب موجود؟» با `ConfirmDialog`
- ذخیره‌ی Snapshot کامل تراکنش فعلی

### ۱۵-۳ `LoadTemplateDialog.tsx`
- لیست قابل جستجو با پیش‌نمایش خلاصه (تعداد Attribute، مبلغ، نوع تراکنش)
- در صورت `isDirty` بودن پیش‌نویس فعلی → `ConfirmDialog` قبل از جایگزینی
- بارگذاری از طریق Action `loadFromTemplate` در Store (تسک ۰۷)

### ۱۵-۴ `TemplateList.tsx` — صفحه `/templates`
- جدول/کارت: نام · توضیح · تعداد فیلد · تاریخ ایجاد و بروزرسانی (شمسی)
- عملیات: بارگذاری · ویرایش نام/توضیح · کپی (Duplicate) · حذف (با تأیید) · Export/Import JSON
- `EmptyState` با دکمه «ساخت اولین قالب»

### ۱۵-۵ قالب‌های پیش‌فرض (Seed)
درج ۳ قالب نمونه در اجرای اول (طبق نیاز کاربران هدف §۱):
1. تراکنش کارت‌به‌کارت عادی
2. تراکنش با مبلغ بالا (سناریوی Fraud)
3. تراکنش با فیلدهای حداقلی (تست فیلدهای الزامی)

## فایل‌های خروجی
```
src/features/templates/api/templates-api.ts
src/features/templates/components/{TemplateList,SaveTemplateDialog,LoadTemplateDialog,TemplateCard}.tsx
src/features/templates/hooks/useTemplates.ts
src/features/templates/data/default-templates.json
src/pages/TemplatesPage.tsx
```

## معیار پذیرش
- [ ] ذخیره‌ی قالب و بازیابی آن پس از Refresh کار می‌کند.
- [ ] نام تکراری مسدود می‌شود با پیام فارسی.
- [ ] بارگذاری قالب روی پیش‌نویس تغییریافته، ابتدا تأیید می‌گیرد.
- [ ] حذف قالب با تأیید انجام می‌شود و برگشت‌ناپذیری آن هشدار داده می‌شود.
- [ ] ۳ قالب پیش‌فرض در اجرای اول ایجاد می‌شوند و با `templateSchema` معتبرند.
- [ ] Export/Import قالب Round-trip موفق دارد.
- [ ] سایر بندهای DoD §۱۳.