/**
 * هدف فایل: ناحیه انتخاب یا Drag & Drop فایل با جایگزین دکمه انتخاب.
 * جایگاه معماری: shared/components برای Import فایل‌های JSON و دیتابیس.
 */
import { Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';

export interface FileDropzoneProps {
  readonly accept?: string;
  readonly label: string;
  readonly onFileSelect: (file: File) => void;
}

/**
 * فایل را از طریق انتخاب دستی یا Drop دریافت می‌کند.
 *
 * @param props - نوع فایل مجاز، label و callback فایل.
 * @returns Dropzone دسترس‌پذیر با ورودی مخفی فایل.
 * @example
 * <FileDropzone label="فایل JSON" accept=".json" onFileSelect={loadFile} />
 */
export function FileDropzone({ accept, label, onFileSelect }: FileDropzoneProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      className={cn('rounded-xl border border-dashed border-border bg-surface p-6 text-center transition', isDragging && 'border-primary bg-muted')}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files.item(0);
        if (file !== null) onFileSelect(file);
      }}
    >
      <Upload className="mx-auto size-8 text-primary" aria-hidden="true" />
      <p className="mt-3 text-sm font-medium">{label}</p>
      <Button type="button" variant="outline" className="mt-4" onClick={() => inputRef.current?.click()}>
        انتخاب فایل
      </Button>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept={accept}
        onChange={(event) => {
          const file = event.target.files?.item(0);
          if (file !== null && file !== undefined) onFileSelect(file);
        }}
      />
    </div>
  );
}
