/**
 * Ù‡Ø¯Ù ÙØ§ÛŒÙ„: ØªØ³Øª Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Payload flat Ù…Ù‚ØµØ¯.
 * Ø¬Ø§ÛŒÚ¯Ø§Ù‡ Ù…Ø¹Ù…Ø§Ø±ÛŒ: ØªØ³Øª ÙˆØ§Ø­Ø¯ Zod Ø¨Ø±Ø§ÛŒ features/payload.
 */
import { describe, expect, it } from 'vitest';

import { payloadSchema } from './payload.schema';

describe('payloadSchema', () => {
  it('Ø¨Ø§ÛŒØ¯ Payload flat Ø¨Ø§ attrsList Ú©Ø¯Ø¯Ø§Ø± Ø±Ø§ Ù‚Ø¨ÙˆÙ„ Ú©Ù†Ø¯', () => {
    const payload = {
      fraudMessageId: 'FR-1',
      sysName: 'CORE',
      businessId: 'PASSARGAD',
      attrsList: [{ '951': '5', '976': ['paya', 'satna'], '996': '11000', '1000': 'MSG-1' }],
    };

    expect(payloadSchema.safeParse(payload).success).toBe(true);
  });

  it('Ø¨Ø§ÛŒØ¯ Ú©Ø¯ Ø®Ø§Ø±Ø¬ Ø§Ø² Ø¨Ø§Ø²Ù‡ Ø±Ø§ Ø±Ø¯ Ú©Ù†Ø¯', () => {
    const payload = {
      fraudMessageId: 'FR-1',
      sysName: 'CORE',
      businessId: 'PASSARGAD',
      attrsList: [{ '950': 'invalid' }],
    };

    expect(payloadSchema.safeParse(payload).success).toBe(false);
  });

  it('Ø¨Ø§ÛŒØ¯ Ù…Ù‚Ø¯Ø§Ø± ØºÛŒØ±Ø±Ø´ØªÙ‡â€ŒØ§ÛŒ Ø±Ø§ Ø±Ø¯ Ú©Ù†Ø¯', () => {
    const payload = {
      fraudMessageId: 'FR-1',
      sysName: 'CORE',
      businessId: 'PASSARGAD',
      attrsList: [{ '996': 11000 }],
    };

    expect(payloadSchema.safeParse(payload).success).toBe(false);
  });
});
