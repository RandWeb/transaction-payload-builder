/**
 * هدف فایل: ساخت پیش‌نمایش زنده Payload از وضعیت فعلی تراکنش و Mapping.
 * جایگاه معماری: features/payload/hooks و پل خواندنی بین Store و موتور Mapping.
 */
import { useMemo } from 'react';

import { buildPayload, type BuildOutput } from '@/features/mappings';
import { useActiveMapping, useDraftTransaction } from '@/stores';
import type { Result } from '@/shared/types/result.types';

export interface PayloadPreviewState {
  readonly result: Result<BuildOutput> | null;
  readonly isLoading: boolean;
}

/**
 * با تغییر تراکنش یا Mapping، خروجی Build را بدون نوشتن در Store محاسبه می‌کند.
 *
 * @returns نتیجه ساخت Payload برای نمایش زنده.
 */
export function usePayloadPreview(): PayloadPreviewState {
  const draftTransaction = useDraftTransaction();
  const activeMapping = useActiveMapping();

  const result = useMemo<Result<BuildOutput> | null>(() => {
    if (activeMapping === null) return null;
    return buildPayload(draftTransaction, activeMapping, { mappingVersion: 'active' });
  }, [activeMapping, draftTransaction]);

  return { result, isLoading: false };
}
