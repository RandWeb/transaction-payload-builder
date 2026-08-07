# TASK 04 — App Shell، Routing و Layouts

> ⚠️ رعایت کامل `../GLOBAL-RULES.md` الزامی است.

**پیش‌نیاز:** 03 · **خروجی:** پوسته‌ی برنامه با ناوبری کامل

---

## هدف
ساخت `App.tsx`، `router.tsx`، `providers.tsx` و Layout ها مطابق ساختار Locked.

## شرح کار

### ۴-۱ `app/providers.tsx`
ترتیب Provider ها از بیرون به داخل:
`ErrorBoundary → ThemeProvider → QueryClientProvider → RouterProvider → ToastProvider`
- `QueryClient` با `retry: 1`, `staleTime: 30_000`, `refetchOnWindowFocus: false`
- `ErrorBoundary` سراسری با UI فارسی + دکمه‌ی «بازیابی» (§۸.۷)

### ۴-۲ `app/router.tsx` — نقشه مسیرها
| مسیر | صفحه | توضیح |
|------|------|-------|
| `/` | Redirect → `/workspace` | |
| `/workspace` | میز کار اصلی | ادیتور تراکنش + پیش‌نمایش Payload کنار هم |
| `/mappings` | مدیریت Mapping | جدول کدهای 951–1000 |
| `/mappings/:version` | جزئیات نسخه Mapping | |
| `/history` | تاریخچه ارسال (Audit) | |
| `/history/:id` | جزئیات یک ارسال | |
| `/templates` | مدیریت قالب‌ها | |
| `/settings` | تنظیمات (تم، API، دیتابیس) | |
| `*` | صفحه ۴۰۴ فارسی | |

- تمام صفحات با `React.lazy` + `Suspense` (Code Splitting)
- عنوان تب مرورگر با هوک `useDocumentTitle`

### ۴-۳ `app/layouts/AppLayout.tsx`
- Header: لوگو + نام برنامه + سوییچ تم + وضعیت اتصال به API (Mock/Real) + Badge نسخه Mapping فعال
- Sidebar: ناوبری با آیکون‌های Lucide؛ در **موبایل** به‌صورت Drawer با Overlay و بستن با `Esc`
- Main: `<Outlet />` با Container و Padding واکنش‌گرا
- ⛔ بدون بخش کاربر/خروج (پروژه تک‌کاربره و بدون احراز هویت §۱)

### ۴-۴ `app/layouts/WorkspaceLayout.tsx`
- چیدمان دوستونی **Split**: ستون راست = ویرایش تراکنش، ستون چپ = پیش‌نمایش Payload
- `lg` به بالا: دوستونی · زیر `lg`: تک‌ستونی با `Tabs` («ویرایش» / «پیش‌نمایش»)
- نوار عملیات چسبان پایین در موبایل (اعتبارسنجی / ساخت Payload / ارسال)

### ۴-۵ Route Error Element
هر مسیر `errorElement` اختصاصی با `ErrorAlert` داشته باشد.

## فایل‌های خروجی
```
src/app/{App.tsx,router.tsx,providers.tsx}
src/app/layouts/{AppLayout.tsx,WorkspaceLayout.tsx}
src/app/components/{AppHeader.tsx,AppSidebar.tsx,ThemeToggle.tsx,ApiStatusBadge.tsx}
src/pages/*  (Placeholder صفحات، بدنه در تسک‌های بعد)
src/shared/hooks/useDocumentTitle.ts
```

## معیار پذیرش
- [ ] ناوبری بین همه مسیرها بدون Reload کامل کار می‌کند.
- [ ] در موبایل (320px) Sidebar به Drawer تبدیل و با `Esc` بسته می‌شود.
- [ ] مسیر نامعتبر → صفحه ۴۰۴ فارسی.
- [ ] پرتاب خطای عمدی در یک صفحه → `ErrorBoundary` بدون سفید شدن کل برنامه.
- [ ] سایر بندهای DoD §۱۳.