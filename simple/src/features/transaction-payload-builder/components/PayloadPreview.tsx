import { useState } from "react";
import { type OutputPayload } from "../types/transaction.types";
import { formatJson } from "@/lib/json.utils";

interface PayloadPreviewProps {
  payload: OutputPayload | null;
}

export function PayloadPreview({ payload }: PayloadPreviewProps) {
  const [copied, setCopied] = useState(false);

  if (!payload) return null;

  const content = formatJson(payload);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold" style={{ color: "var(--color-text-primary-raw)" }}>
          خروجی نهایی (Payload)
        </h3>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-3 py-1.5 text-xs transition-colors"
          style={{
            background: "var(--color-surface-hover-raw)",
            color: "var(--color-text-secondary-raw)",
          }}
        >
          {copied ? "کپی شد!" : "کپی کردن JSON"}
        </button>
      </div>
      <pre
        className="h-96 overflow-auto rounded-xl border-2 p-4 code-block text-xs leading-relaxed"
        style={{
          background: "var(--color-code-bg-raw)",
          borderColor: "var(--color-code-bg-raw)",
          color: "var(--color-code-fg-raw)",
        }}
      >
        {content}
      </pre>
    </div>
  );
}
