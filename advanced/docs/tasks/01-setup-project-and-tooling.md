# TASK 01 — راه‌اندازی پروژه و ابزارها

> ⚠️ رعایت کامل `../GLOBAL-RULES.md` الزامی است.

**پیش‌نیاز:** ندارد · **خروجی:** پروژه‌ی قابل اجرا با اسکلت پوشه‌ها

---

## هدف
ایجاد پروژه‌ی Vite + React + TypeScript با Tailwind، Path Alias، ابزارهای کیفیت کد، تنظیمات محیطی و اسکلت کامل پوشه‌ها به‌گونه‌ای که `npm run dev` بدون خطا اجرا شود.

## شرح کار

### ۱-۱ ایجاد پروژه
- `npm create vite@latest . -- --template react-ts`
- Node 20 LTS، `packageManager` در `package.json` قید شود.

### ۱-۲ نصب وابستگی‌های Locked (فقط موارد مجاز در GLOBAL-RULES)
- runtime: `react-router-dom`, `zustand`, `@tanstack/react-query`, `react-hook-form`, `zod`, `@hookform/resolvers`, `lucide-react`, `clsx`, `tailwind-merge`
- dev: `tailwindcss`, `postcss`, `autoprefixer`, `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`, `eslint`, `prettier`, `prettier-plugin-tailwindcss`, `@typescript-eslint/*`

### ۱-۳ TypeScript
- فعال‌سازی `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes`
- Path Alias در `tsconfig.json` + `vite.config.ts`:
  `@/*` → `src/*` و alias های `@/app`, `@/features`, `@/shared`, `@/stores`, `@/config`

### ۱-۴ Tailwind
- `tailwind.config.ts` با `content` صحیح، `darkMode: 'class'`
- تعریف رنگ‌ها بر پایه‌ی CSS Variables (مقادیر واقعی در تسک ۰۲)
- تعریف `screens` مطابق ۶ Breakpoint سراسری:
  `xs:320px, sm:375px, md:768px, lg:1024px, xl:1440px, 2xl:1920px`
- `fontFamily.sans` → `Vazirmatn`

### ۱-۵ ESLint + Prettier
- قواعد سخت‌گیرانه: منع `any`، منع `console.log` در Production، اجبار `import type`
- قاعده‌ی مرزبندی وابستگی: منع import از `features/*/**` بین feature ها (با `no-restricted-imports`)

### ۱-۶ تنظیمات محیطی
- `src/config/env.ts` — خواندن + **اعتبارسنجی Zod** روی `import.meta.env` با Fail-Fast
- `src/config/app-config.ts` — ثابت‌های غیرحساس: نام برنامه، محدوده کد مقصد (951–1000)، سقف حجم فایل آپلود، Timeout پیش‌فرض
- `.env.example` (کامیت می‌شود) + `.env` در `.gitignore`

### ۱-۷ اسکلت پوشه‌ها
تمام پوشه‌های ساختار Locked ایجاد شوند (هر پوشه با `index.ts` یا `.gitkeep`).

### ۱-۸ اسکریپت‌ها
`dev`, `build`, `preview`, `lint`, `lint:fix`, `format`, `typecheck`, `test`, `test:ui`, `test:coverage`

### ۱-۹ Vitest
`vitest.config.ts` با `environment: 'jsdom'`, `setupFiles: src/test/setup.ts`, `globals: true`

## فایل‌های خروجی
```
package.json · tsconfig.json · tsconfig.node.json · vite.config.ts
tailwind.config.ts · postcss.config.js · .eslintrc.cjs · .prettierrc
.env.example · .gitignore · vitest.config.ts
src/config/env.ts · src/config/app-config.ts
src/test/setup.ts · src/main.tsx · src/index.css
```

## معیار پذیرش
- [ ] `npm run dev` بالا می‌آید و صفحه‌ی خالی با فونت Vazirmatn و `dir="rtl"` نمایش می‌دهد.
- [ ] `npm run typecheck`, `npm run lint`, `npm run test` سبز.
- [ ] با حذف یک متغیر الزامی از `.env`، برنامه با **پیام فارسی واضح** بالا نمی‌آید (Fail-Fast).
- [ ] import با `@/shared/...` کار می‌کند.
- [ ] سایر بندهای DoD در `GLOBAL-RULES.md` §۱۳.

## ثبت در DECISIONS.md
- انتخاب Vite، دلیل ساختار Feature-Based، دلیل Fail-Fast در `env.ts`.