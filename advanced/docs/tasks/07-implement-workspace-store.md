# TASK 07 — Workspace Store (Zustand)

> ⚠️ رعایت کامل `../GLOBAL-RULES.md` الزامی است.

**پیش‌نیاز:** 05, 06 · **خروجی:** وضعیت مرکزی میز کار

---

## هدف
مدیریت وضعیت **کلاینت** (تراکنش در حال ویرایش، Mapping فعال، Payload تولیدشده، نتایج اعتبارسنجی) با Zustand.

> 🔑 **قاعده تفکیک وضعیت:**
> Zustand → وضعیت UI و پیش‌نویس کاربر
> TanStack Query → داده‌های آمده از DB/API (تسک ۱۳ و ۱۴)
> ⛔ داده‌ی سروری در Zustand کپی نشود.

## شرح کار

### ۷-۱ ساختار Store — `src/stores/workspace.store.ts`
State:
- `draftTransaction: Transaction`
- `activeMapping: Mapping | null`
- `builtPayload: Payload | null`
- `validation: { transaction: ValidationIssue[]; mapping: ValidationIssue[] }`
- `isDirty: boolean`
- `lastBuiltAt: string | null`

Actions:
- `setDraftTransaction`, `patchDraftTransaction`
- `addAttribute`, `updateAttribute`, `removeAttribute`, `reorderAttribute`
- `loadTransactionFromJson(json: unknown)` → با Zod Parse
- `resetDraft`, `loadFromTemplate(template)`
- `setActiveMapping`, `buildPayload`, `clearPayload`
- `setValidationIssues`

### ۷-۲ Slice Pattern
تقسیم به Slice های `transactionSlice`, `mappingSlice`, `payloadSlice` و ترکیب در یک Store — برای خوانایی و جلوگیری از فایل غول‌پیکر.

### ۷-۳ Persist
- Middleware `persist` فقط روی `draftTransaction` و `isDirty` با کلید `ftf:workspace`
- `version` + `migrate` برای تغییرات آینده‌ی ساختار
- ⛔ Payload و نتایج اعتبارسنجی Persist نشوند (مشتق‌شده‌اند)

### ۷-۴ Selector ها
- Export کردن Selector های اختصاصی (`useDraftTransaction`, `useActiveMapping`, ...) برای جلوگیری از Re-render غیرضروری
- استفاده از `useShallow` در انتخاب چند مقداره

### ۷-۵ هوک Feature — `features/transactions/hooks/useTransactionEditor.ts`
واسط بین فرم و Store؛ منطق فرم مستقیماً با Store کوپل نشود.

## فایل‌های خروجی
```
src/stores/workspace.store.ts
src/stores/slices/{transaction.slice.ts,mapping.slice.ts,payload.slice.ts}
src/stores/selectors.ts
src/features/transactions/hooks/useTransactionEditor.ts
+ workspace.store.test.ts
```

## معیار پذیرش
- [ ] با Refresh، پیش‌نویس تراکنش حفظ می‌شود.
- [ ] تغییر یک Attribute باعث Re-render کل لیست نمی‌شود (بررسی با React DevTools Profiler).
- [ ] `loadTransactionFromJson` با ورودی نامعتبر، Store را خراب نمی‌کند و `AppError` برمی‌گرداند.
- [ ] تست‌های Store شامل: افزودن/حذف/ویرایش Attribute، Reset، Load از Template، Migration نسخه Persist.
- [ ] سایر بندهای DoD §۱۳.