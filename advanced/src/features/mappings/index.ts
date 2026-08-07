/**
 * هدف فایل: API عمومی Feature Mapping برای مصرف کنترل‌شده توسط Feature های دیگر.
 * جایگاه معماری: مرز عمومی features/mappings.
 */
export { mappingCodeSchema, mappingSchema, mappingSourceFieldSchema } from './schemas/mapping.schema';
export type { Mapping, MappingCode, MappingRequiredCodes, MappingSourceField } from './types/mapping.types';
export { defaultMapping } from '@/shared/data/default-mapping';
export { MappingDiffViewer } from './components/MappingDiffViewer';
export { MappingEditor } from './components/MappingEditor';
export { MappingImportDialog } from './components/MappingImportDialog';
export { MappingTable } from './components/MappingTable';
export { MappingValidationPanel } from './components/MappingValidationPanel';
export { MappingVersionList } from './components/MappingVersionList';
export { useActiveMapping } from './hooks/useActiveMapping';
export { useMappings } from './hooks/useMappings';
export {
  createMappingRows,
  diffMappings,
  filterMappingRows,
  getTargetCodes,
  suggestNextVersion,
  updateMappingEntry,
  validateMappingAgainstTransaction,
} from './utils/mapping-manager';
export type { MappingDiff, MappingFilter, MappingIssue, MappingIssueSeverity, MappingRow, MappingSortKey } from './utils/mapping-manager';
export {
  buildPayload,
  createMappingFields,
  fieldTransformers,
  OMIT,
  resolveValue,
  transformJalaliToIso,
  validateMapping,
  validateTransactionAgainstMapping,
} from './engine';
export type { BuildPayloadOptions, Transformer } from './engine';
export type {
  BuildOutput,
  BuildReport,
  BuildValidationIssue,
  MappingField,
  OmitToken,
  ResolvedValue,
  ResolvedValueSource,
  TransformName,
} from './types/build-report.types';
