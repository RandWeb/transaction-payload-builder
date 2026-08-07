# TASK 14 — ارسال تراکنش و تاریخچه Audit

> ⚠️ رعایت کامل `../GLOBAL-RULES.md` الزامی است.
> ⭐ تحقق‌بخش گام‌های ۴ و ۵ هدف اصلی پروژه (§۱).

**پیش‌نیاز:** 11, 13, 06 · **خروجی:** جریان کامل ارسال + ثبت Audit

---

## هدف
ارسال Payload نهایی به `POST /transaction` و **ذخیره‌ی درخواست، پاسخ، خطا و نسخه Mapping** برای Audit.

## شرح کار

### ۱۴-۱ `hooks/useSubmitTransaction.ts`
با **TanStack Query Mutation**:
1. `buildPayload` (Engine تسک ۱۱) → در صورت خطا، توقف و نمایش خطاها
2. ثبت رکورد `pending` در دیتابیس (تا در صورت قطعی برق/بستن تب هم ردی بماند)
3. فراخوانی `submitTransaction` (تسک ۱۳)
4. بروزرسانی رکورد با پاسخ / خطا / `httpStatus` / `durationMs`
5. Invalidate کردن Query تاریخچه
6. نمایش Toast موفقیت یا خطا

**داده‌های الزامی ذخیره‌شده در هر رکورد (§۱):**
`requestPayload` · `responseBody` · `error` · `mappingVersion` · `transactionSnapshot` · `httpStatus` · `durationMs` · `requestId` · `createdAt` (شمسی + ISO)

> ⚠️ داده‌های حساس در Snapshot طبق §۱۰ **Mask** شوند.

### ۱۴-۲ `SubmitTransactionButton.tsx`
- غیرفعال در صورت وجود خطای مسدودکننده یا نبود Mapping فعال
- حالت `isLoading` با متن «در حال ارسال...» و جلوگیری از کلیک مکرر (Double-Submit Guard)
- `ConfirmDialog` قبل از ارسال با خلاصه: تعداد فیلد، نسخه Mapping، مقصد
- امکان **لغو** درخواست در حال اجرا (`AbortController`)

### ۱۴-۳ `SubmissionResultDialog.tsx`
نمایش نتیجه در سه Tab:
- **خلاصه**: وضعیت (موفق/ناموفق) · کد HTTP · مدت‌زمان · `referenceId` · `requestId`
- **درخواست**: Payload ارسالی (JSON فقط‌خواندنی + دکمه کپی)
- **پاسخ**: بدنه پاسخ یا جزئیات خطا

دکمه‌های اقدام: «تلاش مجدد» · «مشاهده در تاریخچه» · «کپی گزارش خطا»

### ۱۴-۴ `SubmissionHistoryTable.tsx` — صفحه `/history`
- ستون‌ها: تاریخ شمسی · شناسه تراکنش · وضعیت (Badge با آیکون) · کد HTTP · مدت‌زمان · نسخه Mapping
- فیلترها: بازه تاریخ شمسی · وضعیت · نسخه Mapping · جستجو در شناسه
- صفحه‌بندی سمت دیتابیس (`LIMIT/OFFSET`)
- عملیات هر ردیف: مشاهده جزئیات · **بارگذاری مجدد تراکنش در میز کار (Replay)** · کپی Payload
- Export تاریخچه به JSON/CSV
- «پاک‌سازی تاریخچه» با `ConfirmDialog`
- در موبایل: Card List

### ۱۴-۵ صفحه جزئیات `/history/:id`
نمایش کامل رکورد + دکمه‌ی **مقایسه با ارسال دیگر** (استفاده از `PayloadDiffViewer` تسک ۱۲ — بدون تکرار کد §۲.۸).

## فایل‌های خروجی
```
src/features/submissions/hooks/{useSubmitTransaction.ts,useSubmissionHistory.ts}
src/features/submissions/components/{SubmitTransactionButton,SubmissionResultDialog,SubmissionHistoryTable,SubmissionFilters,SubmissionDetail}.tsx
src/features/submissions/utils/submission-export.ts
src/pages/{HistoryPage.tsx,SubmissionDetailPage.tsx}
```

## معیار پذیرش
- [ ] ارسال موفق → رکورد با تمام فیلدهای الزامی در دیتابیس ذخیره می‌شود.
- [ ] ارسال ناموفق (هر ۶ سناریوی Mock) → خطا با پیام فارسی ذخیره و نمایش داده می‌شود.
- [ ] `mappingVersion` در رکورد **دقیقاً** نسخه‌ی زمان ارسال است (نه نسخه فعلی).
- [ ] پس از Refresh، تاریخچه از دیتابیس بازیابی می‌شود.
- [ ] کلیک مکرر روی دکمه ارسال، رکورد تکراری ایجاد نمی‌کند.
- [ ] لغو درخواست، رکورد را با وضعیت مناسب می‌بندد (بدون رکورد `pending` سرگردان).
- [ ] Replay یک تراکنش قدیمی، میز کار را درست پر می‌کند.
- [ ] شماره کارت در تاریخچه Mask است.
- [ ] سایر بندهای DoD §۱۳.