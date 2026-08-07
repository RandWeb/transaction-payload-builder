/**
 * هدف فایل: کپی Payload مقصد به‌صورت JSON یا cURL با بازخورد Toast.
 * جایگاه معماری: features/payload/components و اکشن ارائه خروجی بدون ارسال شبکه.
 */
import { Copy } from 'lucide-react';
import { useMemo } from 'react';

import type { Payload } from '@/features/payload';
import { env } from '@/config/env';
import { Button } from '@/shared/components/ui/Button';
import { Select } from '@/shared/components/ui/Select';
import { useCopyToClipboard } from '@/shared/hooks/useCopyToClipboard';
import { useToast } from '@/shared/hooks/useToast';
import { buildCurlCommand } from '../utils/payload-formatter';

export type CopyPayloadMode = 'pretty' | 'minified' | 'curl';

export interface CopyPayloadButtonProps {
  readonly payload: Payload;
  readonly mode: CopyPayloadMode;
  readonly onModeChange: (mode: CopyPayloadMode) => void;
}

const modeLabels: Record<CopyPayloadMode, string> = {
  pretty: 'JSON خوانا',
  minified: 'JSON فشرده',
  curl: 'cURL',
};

/**
 * متن قابل کپی Payload را بر اساس حالت انتخاب‌شده تولید می‌کند.
 *
 * @param payload - Payload مقصد.
 * @param mode - حالت کپی انتخاب‌شده.
 * @returns متن JSON یا cURL.
 */
function createCopyText(payload: Payload, mode: CopyPayloadMode): string {
  if (mode === 'pretty') return JSON.stringify(payload, null, 2);
  if (mode === 'minified') return JSON.stringify(payload);
  return buildCurlCommand(payload, { baseUrl: env.VITE_API_BASE_URL, endpoint: env.VITE_TRANSACTION_ENDPOINT });
}

/**
 * کنترل کپی Payload با گزینه‌های Pretty، Minified و cURL.
 *
 * @param props - Payload و حالت کپی.
 * @returns دکمه کپی همراه با Select نوع خروجی.
 */
export function CopyPayloadButton({ payload, mode, onModeChange }: CopyPayloadButtonProps): JSX.Element {
  const { copy } = useCopyToClipboard();
  const { showToast } = useToast();
  const copyText = useMemo(() => createCopyText(payload, mode), [mode, payload]);

  const copyPayload = async (): Promise<void> => {
    const copied = await copy(copyText);
    showToast({ type: copied ? 'success' : 'error', message: copied ? `${modeLabels[mode]} کپی شد.` : 'کپی Payload ناموفق بود.' });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        aria-label="نوع کپی Payload"
        value={mode}
        onChange={(event) => onModeChange(event.target.value as CopyPayloadMode)}
        options={[
          { value: 'pretty', label: 'JSON خوانا' },
          { value: 'minified', label: 'JSON فشرده' },
          { value: 'curl', label: 'cURL امن' },
        ]}
      />
      <Button type="button" variant="outline" size="sm" leftIcon={<Copy className="size-4" aria-hidden="true" />} onClick={() => void copyPayload()}>
        کپی
      </Button>
    </div>
  );
}
