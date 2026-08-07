/**
 * هدف فایل: تایپ‌های مشتق‌شده Payload از Schemaهای Zod.
 * جایگاه معماری: features/payload/types و بدون تعریف دستی هم‌پوشان.
 */
import type { z } from 'zod';

import type { payloadLegSchema, payloadSchema, payloadValueSchema } from '../schemas/payload.schema';

export type PayloadValue = z.infer<typeof payloadValueSchema>;
export type PayloadLeg = z.infer<typeof payloadLegSchema>;
export type Payload = z.infer<typeof payloadSchema>;

