# TASK 02 — ساخت Design System و Theme

> ⚠️ رعایت کامل `../GLOBAL-RULES.md` الزامی است.

**پیش‌نیاز:** 01 · **خروجی:** توکن‌های رنگ، فونت، تم روشن/تاریک، RTL

---

## هدف
پیاده‌سازی هویت بصری (§۵ قواعد سراسری) به‌صورت **CSS Variables** + سیستم Theme با تغییر دستی و ذخیره در LocalStorage.

## شرح کار

### ۲-۱ فونت Vazirmatn (Self-hosted)
- قرار دادن `woff2` در `src/assets/fonts/`
- `@font-face` با `font-display: swap` و وزن‌های 400/500/700
- ⛔ بدون CDN

### ۲-۲ توکن‌ها در `src/index.css`
- `:root` → پالت روشن (Primary `#2563EB`، Secondary `#64748B`، Success `#16A34A`، Warning `#F59E0B`، Error `#DC2626`، BG `#F8FAFC`، Text `#0F172A`)
- `.dark` → پالت تاریک با کنتراست AA
- توکن‌های مکمل: `--color-surface`, `--color-border`, `--color-muted`, `--radius`, `--shadow-card`
- توکن‌های معنایی: `--color-bg-danger-subtle` و مشابه، برای Badge/Alert
- ⛔ هیچ رنگ Hex در کامپوننت‌ها

### ۲-۳ Theme System
- `src/shared/hooks/useTheme.ts` — حالت‌های `light | dark | system`
- ذخیره در LocalStorage با کلید `ftf:theme`
- `ThemeProvider` در `app/providers.tsx`، اعمال `class="dark"` روی `<html>`
- اسکریپت Inline در `index.html` برای جلوگیری از **FOUC** (پرش تم در بارگذاری)
- گوش دادن به `prefers-color-scheme` در حالت `system`

### ۲-۴ RTL
- `<html lang="fa" dir="rtl">`
- استفاده از Logical Properties (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`) به‌جای `pl/pr/ml/mr`
- آیکون‌های جهت‌دار (فلش‌ها) در RTL آینه شوند.

### ۲-۵ ابزارهای فرمت‌دهی فارسی
`src/shared/lib/format.ts`:
- `formatJalaliDate(date): string` → `1405/05/12` (با `Intl.DateTimeFormat('fa-IR-u-ca-persian')`)
- `formatJalaliDateTime(date): string` → `1405/05/12 14:32:10` (۲۴ ساعته)
- `formatToman(amount): string` → `1,500,000 تومان`
- `toPersianDigits(v)` / `toLatinDigits(v)` — قاعده: **UI فارسی، Payload لاتین**
- `maskSensitive(value, type)` → `6037****4455`

### ۲-۶ فایل متون
`src/shared/i18n/fa.ts` — تمام رشته‌های UI به‌صورت Object تایپ‌دار (بدون Hard-code در JSX)

## فایل‌های خروجی
```
src/index.css · src/assets/fonts/*
src/shared/hooks/useTheme.ts
src/shared/lib/format.ts (+ format.test.ts)
src/shared/i18n/fa.ts
index.html (بروزرسانی)
```

## معیار پذیرش
- [ ] سوییچ تم کار می‌کند و بعد از Refresh حفظ می‌شود.
- [ ] بدون FOUC (پرش رنگ) در بارگذاری اولیه.
- [ ] چیدمان RTL درست، بدون Overflow افقی.
- [ ] تست‌های `format.test.ts` سبز (شامل Edge
- [ ] سوییچ تم (`light | dark | system`) کار می‌کند و بعد از Refresh حفظ می‌شود.
- [ ] بدون FOUC (پرش رنگ) در بارگذاری اولیه.
- [ ] چیدمان RTL درست است، بدون Overflow افقی در هیچ‌یک از ۶ Breakpoint.
- [ ] تست‌های `format.test.ts` سبز — شامل Edge Case های زیر:
  - عدد صفر، عدد منفی، `null`/`undefined`
  - تاریخ نامعتبر → پرتاب خطای `AppError` با کد `VALIDATION`
  - رقم فارسی ↔ لاتین رفت‌وبرگشتی (Round-trip)
  - Mask روی رشته‌ی کوتاه‌تر از ۸ کاراکتر
- [ ] هیچ رنگ Hex ای خارج از `index.css` وجود ندارد (با `grep` بررسی شود).
- [ ] کنتراست متن/پس‌زمینه در هر دو تم ≥ 4.5:1.
- [ ] سایر بندهای DoD در `GLOBAL-RULES.md` §۱۳.

## ثبت در DECISIONS.md
- دلیل انتخاب CSS Variables به‌جای دو کلاس Tailwind مجزا.
- دلیل Self-host کردن فونت (اجرای Offline + حریم خصوصی).
- قاعده‌ی «UI فارسی، Payload لاتین» و دلیل آن (سازگاری با سرویس مقصد).