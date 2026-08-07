# TASK 17 — نهایی‌سازی Responsive، a11y و مستندات

> ⚠️ رعایت کامل `../GLOBAL-RULES.md` الزامی است.

**پیش‌نیاز:** تمام تسک‌ها · **خروجی:** پروژه‌ی آماده تحویل

---

## هدف
ممیزی نهایی کیفیت، دسترس‌پذیری، عملکرد و تکمیل مستندات پروژه.

## شرح کار

### ۱۷-۱ ممیزی Responsive
بررسی **همه‌ی صفحات** در هر ۶ Breakpoint (§۵):
| اندازه | موارد بررسی |
|--------|--------------|
| 320px | بدون Overflow افقی · دکمه‌ها قابل لمس (≥44px) · جداول به Card تبدیل شده |
| 375px | فرم‌ها تک‌ستونی و خوانا |
| 768px | Sidebar به حالت Collapsible · جداول با اسکرول کنترل‌شده |
| 1024px | چیدمان دوستونی میز کار فعال |
| 1440px | Container با حداکثر عرض (بدون کشیدگی بیش‌ازحد) |
| 1920px | فضای سفید متعادل، بدون خط‌های خیلی بلند متن |

### ۱۷-۲ ممیزی Accessibility (§۱۱)
- [ ] پیمایش کامل برنامه **فقط با کیبورد**
- [ ] وجود Skip Link به محتوای اصلی
- [ ] تمام فیلدها دارای `<label>` مرتبط
- [ ] تمام دکمه‌های آیکونی دارای `aria-label` فارسی
- [ ] Focus Ring واضح در هر دو تم
- [ ] Focus Trap و بازگشت Focus در همه Dialog ها
- [ ] `aria-live` برای Toast و نتایج اعتبارسنجی
- [ ] کنتراست ≥ 4.5:1 (بررسی با Lighthouse)
- [ ] بررسی با Screen Reader (NVDA) روی جریان اصلی

### ۱۷-۳ ممیزی RTL
- [ ] عدم استفاده از `pl/pr/ml/mr` (فقط Logical Properties)
- [ ] آیکون‌های جهت‌دار آینه‌شده
- [ ] اعداد و JSON در بلوک‌های کد به‌درستی LTR نمایش داده شوند (`dir="ltr"` روی نواحی کد)
- [ ] فرمت تاریخ شمسی و ساعت ۲۴ ساعته در تمام صفحات یکسان

### ۱۷-۴ بهینه‌سازی عملکرد
- Code Splitting همه صفحات + بارگذاری Lazy موتور SQLite WASM
- بررسی Bundle Size و حذف وابستگی‌های بلااستفاده
- `React.memo` / `useMemo` روی لیست‌های بزرگ (Attribute List، Mapping Table)
- Debounce روی جستجوها و ساخت Payload زنده
- هدف Lighthouse: Performance ≥ 90 · Accessibility ≥ 95 · Best Practices ≥ 95

### ۱۷-۵ ممیزی امنیت (§۱۰)
- [ ] `grep` برای Token/URL/کلید Hard-code شده → صفر مورد
- [ ] `.env` در `.gitignore` و `.env.example` کامل
- [ ] Mask داده‌های حساس در UI، تاریخچه و Export
- [ ] بدون `dangerouslySetInnerHTML`
- [ ] بدون `eval` در Transformer ها

### ۱۷-۶ مستندات نهایی
| فایل | محتوا |
|------|-------|
| `README.md` | معرفی، پیش‌نیازها، نصب، اجرا، اسکریپت‌ها، ساختار پوشه، اسکرین‌شات |
| `DECISIONS.md` | تکمیل و مرتب‌سازی تمام ADR های ثبت‌شده |
| `docs/USER-GUIDE.md` | راهنمای فارسی گام‌به‌گام برای تستر و مدیر پروژه |
| `docs/API-CONTRACT.md` | قرارداد نهایی `POST /transaction` (نتیجه Q4) |
| `docs/MAPPING-REFERENCE.md` | جدول کامل کدهای 951–1000 با برچسب فارسی |
| `docs/TROUBLESHOOTING.md` | خطاهای رایج و راه‌حل |
| `CHANGELOG.md` | تغییرات نسخه‌ها |

### ۱۷-۷ آماده‌سازی تحویل
- حذف صفحه‌ی موقت `/__ui` یا محدود کردن آن به حالت Development
- حذف تمام `console.log` های باقی‌مانده
- بررسی نهایی `npm run build` + `npm run preview`
- تولید نسخه‌ی Build و تست دستی جریان کامل روی نسخه Production

## فایل‌های خروجی
```
README.md · CHANGELOG.md · DECISIONS.md (تکمیل)
docs/{USER-GUIDE.md,API-CONTRACT.md,MAPPING-REFERENCE.md,TROUBLESHOOTING.md}
اصلاحات پراکنده در کامپوننت‌ها بر اساس نتایج ممیزی
```

## معیار پذیرش
- [ ] تمام چک‌لیست‌های بالا تیک خورده‌اند.
- [ ] Lighthouse در هر سه معیار به اهداف تعیین‌شده رسیده است.
- [ ] `npm run build` بدون Warning و `npm run preview` جریان کامل را اجرا می‌کند.
- [ ] یک کاربر جدید فقط با `README.md` بتواند پروژه را راه‌اندازی کند.
- [ ] تمام تصمیمات معماری در `DECISIONS.md` مستند شده‌اند.
- [ ] سایر بندهای DoD §۱۳.