/**
 * هدف فایل: دکمه کپی در Clipboard با بازخورد متنی.
 * جایگاه معماری: shared/components برای JSON، Payload و گزارش‌ها.
 */
import { Copy } from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';
import { useCopyToClipboard } from '@/shared/hooks/useCopyToClipboard';

export interface CopyButtonProps {
  readonly text: string;
  readonly label?: string;
}

/**
 * متن ورودی را در Clipboard کپی می‌کند و وضعیت موفقیت نشان می‌دهد.
 *
 * @param props - متن قابل کپی و label اختیاری.
 * @returns دکمه کپی با آیکون.
 * @example
 * <CopyButton text={json} />
 */
export function CopyButton({ text, label = 'کپی' }: CopyButtonProps): JSX.Element {
  const { copied, copy } = useCopyToClipboard();

  return (
    <Button type="button" variant="outline" size="sm" leftIcon={<Copy className="size-4" aria-hidden="true" />} onClick={() => void copy(text)}>
      {copied ? 'کپی شد' : label}
    </Button>
  );
}
