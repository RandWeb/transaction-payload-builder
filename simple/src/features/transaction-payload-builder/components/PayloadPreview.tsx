import { useState } from 'react';
import { type OutputPayload } from '../types/transaction.types';
import { formatJson } from '@/lib/json.utils';

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
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">خروجی نهایی (Payload)</h3>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded bg-gray-100 px-3 py-1.5 text-xs transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          {copied ? 'کپی شد!' : 'کپی کردن JSON'}
        </button>
      </div>
      <pre className="h-96 overflow-auto rounded-xl border-2 border-gray-800 bg-gray-900 p-4 code-block text-xs leading-relaxed text-green-400">
        {content}
      </pre>
    </div>
  );
}
