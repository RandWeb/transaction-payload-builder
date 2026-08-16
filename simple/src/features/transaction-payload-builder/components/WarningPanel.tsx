import { type TransformationWarning } from "../types/transform.types";

interface WarningPanelProps {
  warnings: TransformationWarning[];
}

export function WarningPanel({ warnings }: WarningPanelProps) {
  if (warnings.length === 0) return null;

  const uniqueMissingFields = Array.from(new Set(warnings.map((w) => w.fieldName)));

  return (
    <div
      className="rounded-md border-r-4 p-4"
      style={{
        background: "var(--color-warning-soft-raw)",
        borderColor: "var(--color-warning-raw)",
      }}
    >
      <div
        className="mb-2 flex items-center gap-2 font-bold"
        style={{ color: "var(--color-warning-raw)" }}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span>فیلدهای نگاشت نشده ({uniqueMissingFields.length})</span>
      </div>
      <p
        className="mb-3 text-sm"
        style={{ color: "var(--color-warning-raw)", opacity: 0.8 }}
      >
        فیلدهای زیر در نگاشت شما یافت نشدند و از تراکنش نهایی حذف شدند:
      </p>
      <div className="flex flex-wrap gap-2">
        {uniqueMissingFields.map((field) => (
          <code
            key={field}
            className="rounded border px-2 py-1 text-xs"
            style={{
              background: "var(--color-warning-soft-raw)",
              borderColor: "var(--color-warning-raw)",
              color: "var(--color-warning-raw)",
              opacity: 0.85,
            }}
          >
            {field}
          </code>
        ))}
      </div>
      <details className="mt-3 cursor-pointer">
        <summary
          className="text-xs font-medium"
          style={{ color: "var(--color-warning-raw)", opacity: 0.7 }}
        >
          مشاهدهٔ تمام {warnings.length} مورد وقوع
        </summary>
        <ul
          className="mt-2 max-h-32 overflow-y-auto code-block text-[10px]"
          style={{ color: "var(--color-warning-raw)", opacity: 0.6 }}
        >
          {warnings.map((w, i) => (
            <li key={i}>{w.fieldPath}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
