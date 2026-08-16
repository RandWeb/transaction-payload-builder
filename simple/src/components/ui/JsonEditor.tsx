import { useRef, useState, useCallback, type ChangeEvent, useEffect } from "react";

export interface JsonEditorProps {
  label: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string | undefined;
}

/** استخراج شماره خط و ستون از متن JSON */
function getLineColumn(text: string, position: number): { line: number; column: number } {
  const lines = text.slice(0, position).split("\n");
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

/** تولید شماره خطوط */
function getLineCount(text: string): number {
  return text === "" ? 1 : text.split("\n").length;
}

/** ویرایشگر JSON با شماره خطوط، دکمه فرمت و نمایش خطا */
export function JsonEditor({
  label,
  value,
  onChange,
  error,
  placeholder,
  id,
}: JsonEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [formatError, setFormatError] = useState<string | null>(null);
  const [lineCount, setLineCount] = useState(() => getLineCount(value));

  // به‌روزرسانی تعداد خطوط با تغییر value
  useEffect(() => {
    setLineCount(getLineCount(value));
  }, [value]);

  /** همگام‌سازی اسکرول */
  const syncScroll = useCallback(() => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    setFormatError(null);
  };

  /** فرمت کردن JSON */
  const handleFormat = () => {
    const trimmed = value.trim();
    if (trimmed === "") {
      setFormatError("ورودی خالی است");
      return;
    }
    try {
      const parsed: unknown = JSON.parse(trimmed);
      onChange(JSON.stringify(parsed, null, 2));
      setFormatError(null);
    } catch (err: unknown) {
      if (err instanceof SyntaxError) {
        const match = err.message.match(/position\s+(\d+)/);
        const pos = match ? Number(match[1]) : 0;
        const { line, column } = getLineColumn(trimmed, pos);
        setFormatError(`خطا در خط ${line}، ستون ${column}`);
      } else {
        setFormatError(err instanceof Error ? err.message : "خطای نامشخص");
      }
    }
  };

  const displayError = formatError || error || null;

  // استایل‌های مشترک برای هماهنگی gutter و textarea
  const sharedFontStyle = {
    fontSize: "0.8125rem",
    lineHeight: "1.625rem",
    fontFamily: "var(--font-mono, 'JetBrains Mono', 'Fira Code', monospace)",
    fontVariantLigatures: "none" as const,
  };

  const py = "0.75rem"; // padding top/bottom

  return (
    <div className="flex w-full flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <label
          htmlFor={id}
          className="text-sm font-bold"
          style={{ color: "var(--color-text-primary-raw)" }}
        >
          {label}
        </label>
        <div className="flex items-center gap-2">
          {displayError && (
            <span
              className="max-w-xs truncate text-xs font-medium"
              style={{ color: "var(--color-error-raw)" }}
            >
              {displayError}
            </span>
          )}
          <button
            type="button"
            onClick={handleFormat}
            title="مرتب‌سازی JSON"
            className="rounded-md px-2.5 py-1 text-xs font-medium transition-colors"
            style={{
              background: "var(--color-accent-soft-raw)",
              color: "var(--color-accent-raw)",
            }}
          >
            {"{ }"} مرتب‌سازی
          </button>
        </div>
      </div>

      {/* Editor container */}
      <div
        className="flex h-64 overflow-hidden rounded-lg border-2 transition-all focus-within:ring-2"
        style={{
          borderColor: displayError
            ? "var(--color-error-raw)"
            : "var(--color-border-subtle-raw)",
          "--tw-ring-color": "var(--color-accent-raw)",
          background: "var(--color-surface-input-raw)",
        } as React.CSSProperties}
      >
        {/* Line numbers gutter */}
        <div
          ref={gutterRef}
          aria-hidden="true"
          className="select-none overflow-hidden text-right"
          style={{
            ...sharedFontStyle,
            paddingTop: py,
            paddingBottom: py,
            paddingLeft: "0.75rem",
            paddingRight: "0.5rem",
            minWidth: "3rem",
            color: "var(--color-text-muted-raw)",
            whiteSpace: "pre",
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => i + 1).join("\n")}
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={handleChange}
          onScroll={syncScroll}
          placeholder={placeholder}
          spellCheck={false}
          autoComplete="off"
          className="flex-1 resize-none overflow-auto border-0 bg-transparent p-0 outline-none"
          style={{
            ...sharedFontStyle,
            paddingTop: py,
            paddingBottom: py,
            paddingRight: "0.75rem",
            color: "var(--color-text-primary-raw)",
            direction: "ltr",
            textAlign: "left",
          }}
        />
      </div>
    </div>
  );
}
