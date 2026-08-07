# TASK 08 — ادیتور تراکنش

> ⚠️ رعایت کامل `../GLOBAL-RULES.md` الزامی است.

**پیش‌نیاز:** 03, 05, 07 · **خروجی:** فرم کامل ورود/ویرایش تراکنش

---

## هدف
ساخت رابط ویرایش تراکنش با React Hook Form + Zod، شامل هدر تراکنش و مدیریت پویای Attribute ها.

## شرح کار

### ۸-۱ `TransactionHeaderForm.tsx`
فیلدها: `transactionId`, `transactionType`, `occurredAt`, `amount`, `currency`, `channel`
- `occurredAt` با **تقویم شمسی** و فرمت `1405/05/12` + ساعت ۲۴ ساعته
  > ⚠️ اگر کتابخانه تقویم لازم شد → طبق §۳ ابتدا تأیید بگیر. راهکار پیش‌فرض: سه ورودی عددی سال/ماه/روز + اعتبارسنجی Zod.
- `amount` با فرمت خودکار هزارگان و پسوند «تومان» (ذخیره‌ی مقدار خام عددی)
- دکمه «تولید شناسه» برای `transactionId`
- `mode: 'onBlur'` و `reValidateMode: 'onChange'` در RHF

### ۸-۲ `TransactionAttributeForm.tsx`
افزودن/ویرایش یک Attribute: `name`, `type`, `value`, `label?`
- ورودی `value` بر اساس `type` تغییر شکل دهد (متن / عدد / سوییچ / تاریخ)
- **Autocomplete نام فیلد** از `sourceField` های Mapping فعال (بهبود UX و کاهش خطای انسانی)
- هشدار اگر `name` در Mapping فعال وجود نداشته باشد → «این فیلد در Payload ارسال نخواهد شد»

### ۸-۳ `TransactionAttributeCard.tsx`
نمایش یک Attribute: نام + برچسب فارسی + مقدار (Mask برای فیلدهای حساس §۱۰) + کد مقصد متناظر + دکمه‌های ویرایش/حذف/کپی

### ۸-۴ `TransactionAttributeList.tsx`
- لیست/جدول Attribute ها با **جستجو** و **فیلتر** (همه / نگاشت‌شده / نگاشت‌نشده / خطادار)
- Badge شمارش: «۳۲ از ۵۰ فیلد مقداردار»
- `EmptyState` هنگام خالی بودن
- در موبایل: Card List · در دسکتاپ: Table
- ⛔ Drag & Drop اضافه نشود مگر با تأیید (§۳)

### ۸-۵ ابزارها
- `utils/transaction-defaults.ts` — ساخت تراکنش خالی و مقادیر پیش‌فرض
- `utils/transaction-normalizer.ts` — Trim، تبدیل ارقام فارسی به لاتین، یکسان‌سازی نام فیلدها، حذف Attribute های خالی

### ۸-۶ اعتبارسنجی زنده
نمایش نوار وضعیت بالای فرم: «✅ معتبر» یا «❌ ۳ خطا» با لینک پرش به فیلد خطادار (§۸.۴)

## فایل‌های خروجی
```
src/features/transactions/components/{TransactionHeaderForm,TransactionAttributeForm,TransactionAttributeCard,TransactionAttributeList}.tsx
src/features/transactions/utils/{transaction-defaults.ts,transaction-normalizer.ts}
src/pages/WorkspacePage.tsx (بروزرسانی)
+ تست‌های Normalizer
```

## اصلاحیه نیازمندی Payload و Mapping

این تسک باید با قرارداد قطعی `transaction.json` و `mapping.json` هماهنگ باشد:

- ویرایشگر باید ساختار `mainTransaction` را حفظ کند و فیلدهای `businessId`، `sysName`، `fraudMessageId` و `attrsList` را با همان نام نگه دارد.
- هر عضو `attrsList` یک object خام از field name به مقدار است؛ مقدار مجاز فقط `string` یا `string[]` است.
- مقدارهای آرایه‌ای باید در UI قابل مشاهده و ویرایش باشند و نباید به string join شوند.
- Autocomplete نام فیلد باید از مقدارهای `sourceField` در Mapping فعال استفاده کند، اما ذخیره‌ی داده همچنان با نام field انجام شود، نه کد Mapping.
- اگر کاربر فیلدی وارد کند که در reverse lookup Mapping فعال کد ندارد، UI باید warning واضح نشان دهد: این فیلد در payload ارسال نمی‌شود.
- warning فیلد unmapped باید حداقل نام فیلد و index عضو `attrsList` را برای نمایش بعدی در Payload report قابل استفاده کند.
- ویرایشگر نباید هیچ تبدیل عددی یا تاریخی روی مقدار خام انجام دهد؛ تبدیل payload در Task 11 فقط key mapping انجام می‌دهد.

## معیار پذیرش
- [ ] افزودن، ویرایش، حذف و جستجوی Attribute کار می‌کند و در Store ذخیره می‌شود.
- [ ] ورود ارقام فارسی در فیلد مبلغ → ذخیره‌ی لاتین صحیح.
- [ ] تاریخ نامعتبر (مثل `1405/13/45`) → خطای فارسی.
- [ ] نام تکراری Attribute → خطا و جلوگیری از ثبت.
- [ ] در 320px هیچ Overflow افقی وجود ندارد.
- [ ] کلیک روی خطا، Focus را به فیلد مربوطه می‌برد.
- [ ] سایر بندهای DoD §۱۳.
