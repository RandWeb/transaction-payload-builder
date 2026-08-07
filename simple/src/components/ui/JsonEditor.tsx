import { type ChangeEvent } from 'react';

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
        <label htmlFor={id} className="text-sm font-bold text-gray-700 dark:text-gray-200">
          {label}
        </label>
        {error && <span className="text-xs font-medium text-red-500">{error}</span>}
      </div>
      <textarea
        id={id}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        className={`h-64 rounded-lg border-2 bg-gray-50 p-3 code-block text-sm leading-relaxed transition-all outline-none focus:ring-2 focus:ring-blue-500/50 dark:bg-gray-900 ${error ? 'border-red-300 ring-red-100' : 'border-gray-200 dark:border-gray-800'} `}
      />
    </div>
  );
}
