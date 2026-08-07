/**
 * هدف فایل: تایپ‌های مشترک Mapping مشتق‌شده از Schema مشترک.
 * جایگاه معماری: shared/types برای استفاده در مرزهای ذخیره‌سازی و Featureها بدون import چرخه‌ای.
 */
import type { z } from 'zod';

import type { mappingCodeSchema, mappingRequiredCodesSchema, mappingSchema, mappingSourceFieldSchema } from '@/shared/schemas/mapping.schema';

export type MappingCode = z.infer<typeof mappingCodeSchema>;
export type MappingSourceField = z.infer<typeof mappingSourceFieldSchema>;
export type Mapping = z.infer<typeof mappingSchema>;
export type MappingRequiredCodes = z.infer<typeof mappingRequiredCodesSchema>;
