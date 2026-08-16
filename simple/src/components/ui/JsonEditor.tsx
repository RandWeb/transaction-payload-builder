import { type ChangeEvent } from "react";

export interface JsonEditorProps {
  label: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string | undefined;
}

/** ویرایشگر ساده و سبک JSON با استایل‌های RTL/LTR */
export function JsonEditor({ label, value, onChange, error, placeholder, id }: JsonEditorProps) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <label
          htmlFor={id}
          className="text-sm font-bold"
          style={{ color: "var(--color-text-primary-raw)" }}
        >
          {label}
        </label>
        {error && (
          <span className="text-xs font-medium" style={{ color: "var(--color-error-raw)" }}>
            {error}
          </span>
        )}
      </div>
      <textarea
        id={id}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        className="h-64 rounded-lg border-2 p-3 code-block text-sm leading-relaxed outline-none transition-all focus:ring-2"
        style={{
          background: "var(--color-surface-input-raw)",
          borderColor: error ? "var(--color-error-raw)" : "var(--color-border-subtle-raw)",
          color: "var(--color-text-primary-raw)",
          "--tw-ring-color": "var(--color-accent-raw)",
        } as React.CSSProperties}
      />
    </div>
  );
}
