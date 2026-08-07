import { type MappingDictionary } from '../types/transaction.types';

/**
 * برگرداندن مپینگ:
 * ورودی: {"1000": "AcquireBankCode"}
 * خروجی: {"AcquireBankCode": "1000"}
 * برای جستجوی O(1) در زمان تبدیل.
 */
export function getReverseMapping(mapping: MappingDictionary): Record<string, string> {
  const reverse: Record<string, string> = {};
  for (const [code, fieldName] of Object.entries(mapping)) {
    reverse[fieldName] = code;
  }
  return reverse;
}
