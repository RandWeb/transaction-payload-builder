import { type TransformationWarning } from '../types/transform.types';

interface WarningPanelProps {
  warnings: TransformationWarning[];
}

export function WarningPanel({ warnings }: WarningPanelProps) {
  if (warnings.length === 0) return null;

  // گروه‌بندی هشدارها بر اساس نام فیلد برای شلوغ نشدن رابط کاربری
  const uniqueMissingFields = Array.from(new Set(warnings.map((w) => w.fieldName)));

  return (
    <div className="rounded-md border-r-4 border-amber-400 bg-amber-50 p-4 dark:bg-amber-950/20">
      <div className="mb-2 flex items-center gap-2 text-amber-800 dark:text-amber-300">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span className="font-bold">فیلدهای نگاشت نشده ({uniqueMissingFields.length})</span>
      </div>
      <p className="mb-3 text-sm text-amber-700 dark:text-amber-400">
        فیلدهای زیر در نگاشت شما یافت نشدند و از تراکنش نهایی حذف شدند:
      </p>
      <div className="flex flex-wrap gap-2">
        {uniqueMissingFields.map((field) => (
          <code
            key={field}
            className="rounded border border-amber-200 bg-amber-100 px-2 py-1 text-xs dark:border-amber-800 dark:bg-amber-900"
          >
            {field}
          </code>
        ))}
      </div>
      <details className="mt-3 cursor-pointer">
        <summary className="text-xs font-medium text-amber-600">
          مشاهدهٔ تمام {warnings.length} مورد وقوع
        </summary>
        <ul className="mt-2 max-h-32 overflow-y-auto code-block text-[10px] text-amber-600/80">
          {warnings.map((w, i) => (
            <li key={i}>{w.fieldPath}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
