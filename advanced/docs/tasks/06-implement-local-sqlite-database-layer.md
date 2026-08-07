# TASK 06 — لایه دیتابیس SQLite محلی

> ⚠️ رعایت کامل `../GLOBAL-RULES.md` الزامی است.
> 🔴 **بلوکه تا تأیید Q1** (تناقض SQLite با پروژه Frontend-only).

**پیش‌نیاز:** 05 · **خروجی:** ذخیره‌سازی پایدار Audit، Mapping و Template

---

## هدف
پیاده‌سازی SQLite در مرورگر (WASM) با Persist در IndexedDB، به‌همراه Migration، Repository و Export/Import فایل دیتابیس.

## شرح کار

### ۶-۱ راه‌اندازی موتور
- `shared/db/sqlite-client.ts` — بارگذاری WASM به‌صورت **Lazy** (فقط هنگام نیاز)
- بارگذاری فایل DB از IndexedDB در Startup؛ اگر نبود → ایجاد و اجرای Migration
- Persist خودکار پس از هر تراکنش نوشتن (Debounce شده)
- در صورت عدم پشتیبانی مرورگر → **Fallback به IndexedDB ساده** + هشدار فارسی به کاربر

### ۶-۲ اسکیمای دیتابیس — `shared/db/migrations/`
```sql
-- 001_init.sql
CREATE TABLE mappings (
  version      TEXT PRIMARY KEY,
  created_at   TEXT NOT NULL,
  is_active    INTEGER NOT NULL DEFAULT 0,
  content_json TEXT NOT NULL
);

CREATE TABLE templates (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  description TEXT,
  content_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE submissions (
  id                TEXT PRIMARY KEY,
  created_at        TEXT NOT NULL,
  mapping_version   TEXT NOT NULL,
  request_json      TEXT NOT NULL,
  response_json     TEXT,
  error_json        TEXT,
  http_status       INTEGER,
  duration_ms       INTEGER NOT NULL,
  status            TEXT NOT NULL, -- success | failed | pending
  transaction_snapshot_json TEXT NOT NULL
);

CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX idx_submissions_status     ON submissions(status);
```
- جدول `schema_migrations` برای مدیریت نسخه اسکیما (اجرای یک‌بار و Idempotent)

### ۶-۳ Repository ها — `shared/db/repositories/`
| فایل | متدها |
|------|-------|
| `mapping.repository.ts` | `getActive`, `getByVersion`, `listVersions`, `save`, `setActive`, `delete` |
| `template.repository.ts` | `list`, `getById`, `create`, `update`, `delete`, `existsByName` |
| `submission.repository.ts` | `list(filter, page)`, `getById`, `create`, `deleteAll`, `pruneOlderThan(n)` |

قواعد:
- ⛔ **بدون SQL رشته‌ای الحاقی** — فقط Prepared Statement با پارامتر (جلوگیری از Injection)
- خروجی همه متدها با **Zod Parse** شود (اعتماد نکردن به داده‌ی ذخیره‌شده §۷)
- همه متدها `Promise<Result<T, AppError>>` برگردانند
- خطای دیتابیس → `AppError` با کد `STORAGE`

### ۶-۴ Seed اولیه
اگر جدول `mappings` خالی بود → درج `default-mapping.json` به‌عنوان نسخه `1.0.0` و فعال‌سازی آن.

### ۶-۵ ابزارهای مدیریتی (صفحه Settings)
- Export فایل `.sqlite` (دانلود)
- Import فایل `.sqlite` (با `ConfirmDialog`، چون داده‌ی فعلی جایگزین می‌شود)
- «پاک‌سازی تاریخچه» با تأیید
- نمایش حجم دیتابیس و تعداد رکوردها

### ۶-۶ سقف نگه‌داری
طبق Q10 (پیش‌فرض ۱۰۰۰ رکورد): در `create` اگر از سقف عبور کرد، قدیمی‌ترین‌ها Prune شوند.

## فایل‌های خروجی
```
src/shared/db/sqlite-client.ts
src/shared/db/migrations/{001_init.sql,index.ts}
src/shared/db/repositories/{mapping,template,submission}.repository.ts
src/shared/db/db-export.ts
+ تست‌های Repository (با DB درون‌حافظه‌ای)
```

## معیار پذیرش
- [ ] پس از Refresh مرورگر، داده‌ها باقی می‌مانند.
- [ ] در اجرای اول، `default-mapping.json` به‌صورت خودکار Seed و فعال می‌شود.
- [ ] Export و سپس Import همان فایل، داده‌ها را کامل بازمی‌گرداند.
- [ ] رکوردهای بیش از سقف، Prune می‌شوند.
- [ ] تست Repository ها بدون وابستگی به مرورگر واقعی سبز است.
- [ ] سایر بندهای DoD §۱۳.

## ثبت در DECISIONS.md
- انتخاب نهایی راهکار SQLite (نتیجه Q1) + دلیل + محدودیت‌ها.
- استراتژی Persist و Fallback.