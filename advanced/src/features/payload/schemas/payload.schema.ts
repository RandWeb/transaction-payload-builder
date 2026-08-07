/**
 * Ù‡Ø¯Ù ÙØ§ÛŒÙ„: ØªØ¹Ø±ÛŒÙ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Payload Ù†Ù‡Ø§ÛŒÛŒ flat Ø¨Ø±Ø§ÛŒ `POST /transaction`.
 * Ø¬Ø§ÛŒÚ¯Ø§Ù‡ Ù…Ø¹Ù…Ø§Ø±ÛŒ: features/payload Ùˆ Ù…Ù†Ø¨Ø¹ Ø­Ù‚ÛŒÙ‚Øª Ø®Ø±ÙˆØ¬ÛŒ Ø§Ø±Ø³Ø§Ù„ÛŒ.
 */
import { z } from 'zod';

export const payloadValueSchema = z.union([z.string(), z.array(z.string())]);

export const payloadLegSchema = z.record(
  z.string().regex(/^(95[1-9]|9[6-9]\d|1000)$/, 'Ú©Ø¯ Payload Ø¨Ø§ÛŒØ¯ Ø¨ÛŒÙ† 951 ØªØ§ 1000 Ø¨Ø§Ø´Ø¯.'),
  payloadValueSchema,
);

export const payloadSchema = z.object({
  businessId: z.string().min(1),
  sysName: z.string().min(1),
  fraudMessageId: z.string().min(1),
  attrsList: z.array(payloadLegSchema).min(1),
});
