# TASK 03 — ساخت کامپوننت‌های مشترک UI

> ⚠️ رعایت کامل `../GLOBAL-RULES.md` الزامی است.

**پیش‌نیاز:** 02 · **خروجی:** کتابخانه‌ی داخلی کامپوننت‌های Reusable

---

## هدف
ساخت مجموعه‌ی پایه‌ی UI در `src/shared/components/` تا هیچ Feature ای مجبور به بازنویسی دکمه/ورودی/دیالوگ نشود (قاعده DRY §۲.۸).

## شرح کار

### ۳-۱ ابزار `cn`
`src/shared/lib/cn.ts` — ترکیب `clsx` + `tailwind-merge` برای ادغام امن کلاس‌ها.

### ۳-۲ کامپوننت‌های پایه — `shared/components/ui/`
| کامپوننت | نکات الزامی |
|----------|-------------|
| `Button.tsx` | variant: `primary/secondary/danger/ghost/outline` · size: `sm/md/lg` · `isLoading` با اسپینر · `leftIcon/rightIcon` · `disabled` واقعی + `aria-busy` |
| `Input.tsx` | با `label`, `hint`, `error`, `required` · اتصال `aria-invalid` و `aria-describedby` · `forwardRef` برای RHF |
| `Textarea.tsx` | همانند Input + شمارنده‌ی کاراکتر اختیاری |
| `Select.tsx` | Native select استایل‌شده (a11y ساده‌تر) + placeholder |
| `Checkbox.tsx` / `Switch.tsx` | قابل استفاده با کیبورد (`Space`) |
| `Dialog.tsx` | مبتنی بر `<dialog>` یا Portal · `role="dialog"` · `aria-modal` · **Focus Trap** · بستن با `Esc` · بازگشت Focus |
| `Table.tsx` | ساختار `Table/THead/TBody/TR/TH/TD` · حالت Sticky Header · اسکرول افقی در موبایل |
| `Badge.tsx` | variant های `success/warning/error/info/neutral` · **همیشه آیکون + متن** (ممنوعیت انتقال معنا فقط با رنگ §۱۱) |
| `Tabs.tsx` | ناوبری با `ArrowLeft/ArrowRight` (در RTL معکوس) |
| `Tooltip.tsx` | با تأخیر، قابل فراخوانی با Focus |
| `Spinner.tsx` | `role="status"` + متن پنهان «در حال بارگذاری» |
| `Skeleton.tsx` | برای حالت Loading جدول‌ها |
| `Toast.tsx` + `useToast.ts` | صف پیام‌ها · `aria-live="polite"` · انواع موفقیت/خطا/هشدار |

### ۳-۳ کامپوننت‌های سطح بالاتر — `shared/components/`
- `PageHeader.tsx` — عنوان، زیرعنوان، Breadcrumb، ناحیه‌ی Actions
- `EmptyState.tsx` — آیکون + عنوان + توضیح + دکمه‌ی اقدام
- `ErrorAlert.tsx` — نمایش `AppError` (کد خطا + پیام فارسی + دکمه‌ی «تلاش مجدد» اختیاری + جزئیات جمع‌شونده)
- `ConfirmDialog.tsx` — تأیید عملیات مخرب (حذف Template، پاک‌سازی تاریخچه)
- `JsonCodeEditor.tsx` — ادیتور JSON با شماره خط، Highlight خطای Syntax، دکمه‌ی Format، حالت فقط‌خواندنی
  > ⚠️ **بدون افزودن کتابخانه‌ی خارجی**: پیاده‌سازی با `<textarea>` + لایه‌ی شماره‌گذاری خط.
  > اگر ادیتور حرفه‌ای (CodeMirror) لازم است → طبق §۳ باید ابتدا **تأیید کاربر** گرفته شود.
- `CopyButton.tsx` — کپی در Clipboard + بازخورد «کپی شد» + Fallback برای مرورگر بدون دسترسی

### ۳-۴ قواعد مشترک همه کامپوننت‌ها
- Props صریح و تایپ‌دار (بدون `any`)، گسترش `React.ComponentPropsWithoutRef`
- پشتیبانی از `className` برای Override
- بدون State داخلی غیرضروری (Controlled-first)
- بدون رنگ Hard-code (فقط توکن‌ها)
- JSDoc فارسی + `@example` برای هر کامپوننت (§۹)

## فایل‌های خروجی
```
src/shared/lib/cn.ts
src/shared/components/ui/*.tsx (+ index.ts)
src/shared/components/{PageHeader,EmptyState,ErrorAlert,ConfirmDialog,JsonCodeEditor,CopyButton}.tsx
src/shared/hooks/{useToast,useDisclosure,useCopyToClipboard,useDebounce,useLocalStorage}.ts
```

## معیار پذیرش
- [ ] یک صفحه‌ی موقت `/__ui` تمام کامپوننت‌ها را در هر دو تم رندر می‌کند (بعداً حذف/محدود به Dev).
- [ ] Dialog با `Esc` بسته می‌شود و Focus به Trigger بازمی‌گردد.
- [ ] پیمایش کامل با `Tab` بدون گم‌شدن Focus.
- [ ] `Button` در حالت `isLoading` غیرقابل کلیک است.
- [ ] تست واحد برای `Button`, `Dialog`, `ErrorAlert`, `useToast`.
- [ ] سایر بندهای DoD §۱۳.

## ثبت در DECISIONS.md
- دلیل پیاده‌سازی داخلی `JsonCodeEditor` به‌جای وابستگی خارجی.
- دلیل استفاده از Native `<select>` (a11y + حجم کمتر).