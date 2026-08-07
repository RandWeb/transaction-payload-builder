/**
 * هدف فایل: API عمومی موتور Pure Mapping و Payload Builder.
 * جایگاه معماری: features/mappings/engine و مرز import کنترل‌شده.
 */
export { createMappingFields } from './field-metadata';
export { fieldTransformers, transformJalaliToIso } from './field-transformers';
export type { Transformer } from './field-transformers';
export { validateMapping, validateTransactionAgainstMapping } from './mapping-validator';
export { buildPayload } from './payload-builder';
export type { BuildPayloadOptions } from './payload-builder';
export { OMIT, resolveValue } from './value-resolver';
