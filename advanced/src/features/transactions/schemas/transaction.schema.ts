/**
 * Ù‡Ø¯Ù ÙØ§ÛŒÙ„: ØªØ¹Ø±ÛŒÙ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Zod Ù¾ÛŒØ§Ù… ØªØ±Ø§Ú©Ù†Ø´ Ù…Ø·Ø§Ø¨Ù‚ Ù†Ù…ÙˆÙ†Ù‡ ÙˆØ§Ù‚Ø¹ÛŒ `transaction.json`.
 * Ø¬Ø§ÛŒÚ¯Ø§Ù‡ Ù…Ø¹Ù…Ø§Ø±ÛŒ: features/transactions Ùˆ Ù…Ù†Ø¨Ø¹ Ø­Ù‚ÛŒÙ‚Øª Ø¯Ø§Ø¯Ù‡ ÙˆØ±ÙˆØ¯ÛŒ Ú©Ø§Ø±Ø¨Ø±.
 */
import { z } from 'zod';

export const transactionValueSchema = z.union([z.string(), z.array(z.string())]);

export const transactionLegSchema = z.record(
  z.string().min(1, 'Ù†Ø§Ù… ÙÛŒÙ„Ø¯ ØªØ±Ø§Ú©Ù†Ø´ Ù†Ù…ÛŒâ€ŒØªÙˆØ§Ù†Ø¯ Ø®Ø§Ù„ÛŒ Ø¨Ø§Ø´Ø¯.'),
  transactionValueSchema,
);

export const fraudMessageSchema = z.object({
  mainTransaction: z.object({
    fraudMessageId: z.string().min(1, 'Ø´Ù†Ø§Ø³Ù‡ Ù¾ÛŒØ§Ù… Fraud Ø§Ù„Ø²Ø§Ù…ÛŒ Ø§Ø³Øª.'),
    sysName: z.string().min(1, 'Ù†Ø§Ù… Ø³ÛŒØ³ØªÙ… Ø§Ù„Ø²Ø§Ù…ÛŒ Ø§Ø³Øª.'),
    businessId: z.string().min(1, 'Ø´Ù†Ø§Ø³Ù‡ Ú©Ø³Ø¨â€ŒÙˆÚ©Ø§Ø± Ø§Ù„Ø²Ø§Ù…ÛŒ Ø§Ø³Øª.'),
    attrsList: z.array(transactionLegSchema).min(1, 'Ø­Ø¯Ø§Ù‚Ù„ ÛŒÚ© ØªØ±Ø§Ú©Ù†Ø´ Ø¨Ø§ÛŒØ¯ ÙˆØ¬ÙˆØ¯ Ø¯Ø§Ø´ØªÙ‡ Ø¨Ø§Ø´Ø¯.'),
  }),
});

export const transactionSchema = fraudMessageSchema;
