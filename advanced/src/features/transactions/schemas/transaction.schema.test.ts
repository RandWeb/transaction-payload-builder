/**
 * Ù‡Ø¯Ù ÙØ§ÛŒÙ„: ØªØ³Øª Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Ù¾ÛŒØ§Ù… ØªØ±Ø§Ú©Ù†Ø´ ÙˆØ§Ù‚Ø¹ÛŒ Ù…Ø·Ø§Ø¨Ù‚ transaction.json.
 * Ø¬Ø§ÛŒÚ¯Ø§Ù‡ Ù…Ø¹Ù…Ø§Ø±ÛŒ: ØªØ³Øª ÙˆØ§Ø­Ø¯ Zod Ø¨Ø±Ø§ÛŒ features/transactions.
 */
import { describe, expect, it } from 'vitest';

import sampleTransaction from '../data/sample-transaction.json';
import { transactionSchema } from './transaction.schema';

describe('transactionSchema', () => {
  it('Ø¨Ø§ÛŒØ¯ Ù†Ù…ÙˆÙ†Ù‡ Ù…Ø¹ØªØ¨Ø± transaction.json Ø±Ø§ Ù‚Ø¨ÙˆÙ„ Ú©Ù†Ø¯', () => {
    expect(transactionSchema.safeParse(sampleTransaction).success).toBe(true);
  });

  it('Ø¨Ø§ÛŒØ¯ Ù…Ù‚Ø¯Ø§Ø± number Ø¯Ø± attrsList Ø±Ø§ Ø±Ø¯ Ú©Ù†Ø¯', () => {
    const result = transactionSchema.safeParse({
      mainTransaction: {
        fraudMessageId: 'FR-1',
        sysName: 'CORE',
        businessId: 'PASSARGAD',
        attrsList: [{ TrxAmount: 124000000 }],
      },
    });

    expect(result.success).toBe(false);
  });

  it('Ø¨Ø§ÛŒØ¯ Ù…Ù‚Ø¯Ø§Ø± Ø¢Ø±Ø§ÛŒÙ‡â€ŒØ§ÛŒ string[] Ø±Ø§ Ø¨Ø¯ÙˆÙ† ØªØ¨Ø¯ÛŒÙ„ Ø¨Ù¾Ø°ÛŒØ±Ø¯', () => {
    const result = transactionSchema.safeParse({
      mainTransaction: {
        fraudMessageId: 'FR-1',
        sysName: 'CORE',
        businessId: 'PASSARGAD',
        attrsList: [{ TrxChannel: ['paya', 'satna'] }],
      },
    });

    expect(result.success).toBe(true);
  });
});
