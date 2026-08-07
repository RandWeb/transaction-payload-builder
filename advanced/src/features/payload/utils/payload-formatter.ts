/**
 * Ù‡Ø¯Ù ÙØ§ÛŒÙ„: Ø§Ø¨Ø²Ø§Ø±Ù‡Ø§ÛŒ Pure Ø¨Ø±Ø§ÛŒ Ù†Ù…Ø§ÛŒØ´ØŒ Ú©Ù¾ÛŒ Ùˆ Diff Ú©Ø±Ø¯Ù† Payload Ù…Ù‚ØµØ¯.
 * Ø¬Ø§ÛŒÚ¯Ø§Ù‡ Ù…Ø¹Ù…Ø§Ø±ÛŒ: features/payload/utils Ùˆ Ø¨Ø¯ÙˆÙ† ÙˆØ§Ø¨Ø³ØªÚ¯ÛŒ Ø¨Ù‡ UI ÛŒØ§ Store.
 */
import type { Payload, PayloadLeg, PayloadValue } from '@/features/payload';
import { maskSensitive, toPersianDigits } from '@/shared/lib/format';

export interface PayloadDisplayOptions {
  readonly maskSensitiveValues: boolean;
  readonly persianDigits: boolean;
}

export interface CurlConfig {
  readonly baseUrl: string;
  readonly endpoint: string;
}

export type PayloadDiffKind = 'added' | 'removed' | 'changed';

export interface PayloadDiff {
  readonly path: string;
  readonly kind: PayloadDiffKind;
  readonly before?: PayloadValue;
  readonly after?: PayloadValue;
}

const sensitiveCodePattern = /^(953|956|959|962|965|970|973|974|978|989|997|1000)$/;
const cardLikePattern = /^\d{12,19}$/;
const hashLikePattern = /^[a-f0-9]{32,}$/i;

const normalizeEndpoint = (baseUrl: string, endpoint: string): string => {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${normalizedBase}${normalizedEndpoint}`;
};

const isSensitiveValue = (code: string, value: PayloadValue): boolean => {
  if (Array.isArray(value)) return false;
  return sensitiveCodePattern.test(code) || cardLikePattern.test(value) || hashLikePattern.test(value);
};

const formatDisplayValue = (code: string, value: PayloadValue, options: PayloadDisplayOptions): PayloadValue => {
  if (Array.isArray(value)) return value.map((item) => (options.persianDigits ? toPersianDigits(item) : item));
  if (options.maskSensitiveValues && isSensitiveValue(code, value)) return maskSensitive(value, 'text');
  return options.persianDigits ? toPersianDigits(value) : value;
};

const formatLegForDisplay = (leg: PayloadLeg, options: PayloadDisplayOptions): PayloadLeg =>
  Object.fromEntries(
    Object.entries(leg)
      .sort(([firstCode], [secondCode]) => Number(firstCode) - Number(secondCode))
      .map(([code, value]) => [code, formatDisplayValue(code, value, options)]),
  );

export function formatPayloadForDisplay(payload: Payload, options: PayloadDisplayOptions): Payload {
  return {
    businessId: payload.businessId,
    sysName: payload.sysName,
    fraudMessageId: options.maskSensitiveValues ? maskSensitive(payload.fraudMessageId, 'text') : payload.fraudMessageId,
    attrsList: payload.attrsList.map((leg) => formatLegForDisplay(leg, options)),
  };
}

export function estimatePayloadSize(payload: Payload): number {
  return new TextEncoder().encode(JSON.stringify(payload)).length;
}

export function buildCurlCommand(payload: Payload, config: CurlConfig): string {
  const body = JSON.stringify(payload, null, 2).replace(/'/g, "'\\''");
  return [
    `curl -X POST '${normalizeEndpoint(config.baseUrl, config.endpoint)}'`,
    "-H 'Content-Type: application/json'",
    "-H 'Authorization: Bearer <TOKEN>'",
    `--data '${body}'`,
  ].join(' \\\n  ');
}

const flattenPayload = (payload: Payload): ReadonlyMap<string, PayloadValue> => {
  const entries = new Map<string, PayloadValue>();
  entries.set('fraudMessageId', payload.fraudMessageId);
  entries.set('sysName', payload.sysName);
  entries.set('businessId', payload.businessId);
  payload.attrsList.forEach((leg, legIndex) => {
    Object.entries(leg).forEach(([code, value]) => entries.set(`attrsList.${legIndex}.${code}`, value));
  });
  return entries;
};

const arePayloadValuesEqual = (first: PayloadValue, second: PayloadValue): boolean => JSON.stringify(first) === JSON.stringify(second);

export function diffPayloads(before: Payload, after: Payload): readonly PayloadDiff[] {
  const beforeEntries = flattenPayload(before);
  const afterEntries = flattenPayload(after);
  const paths = [...new Set([...beforeEntries.keys(), ...afterEntries.keys()])].sort();

  return paths.flatMap((path) => {
    const beforeValue = beforeEntries.get(path);
    const afterValue = afterEntries.get(path);
    if (!beforeEntries.has(path)) return [{ path, kind: 'added' as const, after: afterValue }];
    if (!afterEntries.has(path)) return [{ path, kind: 'removed' as const, before: beforeValue }];
    if (beforeValue !== undefined && afterValue !== undefined && !arePayloadValuesEqual(beforeValue, afterValue)) {
      return [{ path, kind: 'changed' as const, before: beforeValue, after: afterValue }];
    }
    return [];
  });
}
