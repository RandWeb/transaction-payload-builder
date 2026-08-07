/**
 * Ù‡Ø¯Ù ÙØ§ÛŒÙ„: ØªØ³Øª formatterØŒ cURL Ùˆ Diff Ù…Ø±Ø¨ÙˆØ· Ø¨Ù‡ Payload Ù…Ù‚ØµØ¯.
 * Ø¬Ø§ÛŒÚ¯Ø§Ù‡ Ù…Ø¹Ù…Ø§Ø±ÛŒ: ØªØ³Øª ÙˆØ§Ø­Ø¯ features/payload/utils.
 */
import { describe, expect, it } from 'vitest';

import type { Payload } from '@/features/payload';
import { buildCurlCommand, diffPayloads, estimatePayloadSize, formatPayloadForDisplay } from './payload-formatter';

const payload: Payload = {
  fraudMessageId: '1403082116532207730195',
  sysName: 'CORE',
  businessId: 'PASSARGAD',
  attrsList: [{ '951': 'ATM', '956': '6037999912345678', '976': ['paya', 'satna'], '996': '۱۲۳' }],
};

describe('payloadFormatter', () => {
  it('Ø¨Ø§ÛŒØ¯ Payload Ù†Ù…Ø§ÛŒØ´ÛŒ Ø±Ø§ Ù…Ø±ØªØ¨ Ùˆ Ù…Ù‚Ø¯Ø§Ø± Ø­Ø³Ø§Ø³ Ø±Ø§ mask Ú©Ù†Ø¯', () => {
    const formatted = formatPayloadForDisplay(payload, { maskSensitiveValues: true, persianDigits: true });

    expect(formatted.fraudMessageId).toContain('****');
    expect(formatted.attrsList[0]?.['956']).toContain('****');
    expect(formatted.attrsList[0]?.['976']).toEqual(['paya', 'satna']);
    expect(Object.keys(formatted.attrsList[0] ?? {})).toEqual(['951', '956', '976', '996']);
  });

  it('Ø¨Ø§ÛŒØ¯ Ø­Ø¬Ù… Payload Ùˆ cURL Ø¨Ø¯ÙˆÙ† Token ÙˆØ§Ù‚Ø¹ÛŒ Ø¨Ø³Ø§Ø²Ø¯', () => {
    const command = buildCurlCommand(payload, { baseUrl: 'https://example.test/api/', endpoint: '/transaction' });

    expect(estimatePayloadSize(payload)).toBeGreaterThan(0);
    expect(command).toContain('https://example.test/api/transaction');
    expect(command).toContain('<TOKEN>');
    expect(command).not.toContain('Bearer sk-');
  });

  it('Ø¨Ø§ÛŒØ¯ ØªØºÛŒÛŒØ±Ø§Øª Ø¯Ùˆ Payload Ø±Ø§ Ø¨Ø± Ø§Ø³Ø§Ø³ Ù…Ø³ÛŒØ± ØªØ´Ø®ÛŒØµ Ø¯Ù‡Ø¯', () => {
    const nextPayload: Payload = {
      ...payload,
      attrsList: [{ '951': 'WEB', '976': ['paya', 'satna'], '996': '123', '997': 'new' }],
    };

    expect(diffPayloads(payload, nextPayload)).toEqual([
      { path: 'attrsList.0.951', kind: 'changed', before: 'ATM', after: 'WEB' },
      { path: 'attrsList.0.956', kind: 'removed', before: '6037999912345678' },
      { path: 'attrsList.0.996', kind: 'changed', before: '۱۲۳', after: '123' },
      { path: 'attrsList.0.997', kind: 'added', after: 'new' },
    ]);
  });
});
