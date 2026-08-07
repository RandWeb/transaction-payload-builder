/**
 * هدف فایل: Slice ساخت و پاک‌سازی Payload مقصد از روی Engine خالص Mapping.
 * جایگاه معماری: stores/slices و وضعیت مشتق‌شده Workspace بدون منطق تبدیل داخلی.
 */
import { buildPayload as buildMappingPayload, type BuildReport, type BuildValidationIssue } from '@/features/mappings';
import { AppError } from '@/shared/api/api-error';
import type { PayloadSlice, WorkspaceSliceCreator } from './workspace.types';

const isBuildValidationIssue = (value: unknown): value is BuildValidationIssue => {
  if (typeof value !== 'object' || value === null) return false;
  return 'message' in value && typeof value.message === 'string';
};

const isBuildReport = (value: unknown): value is BuildReport => {
  if (typeof value !== 'object' || value === null) return false;
  return 'errors' in value && Array.isArray(value.errors);
};

const toMappingIssues = (error: AppError): readonly { readonly path: readonly (string | number)[]; readonly message: string }[] => {
  if (isBuildReport(error.details)) return error.details.errors.map(({ path, message }) => ({ path, message }));
  if (Array.isArray(error.details)) {
    return error.details.map((issue, index) => (isBuildValidationIssue(issue) ? { path: issue.path, message: issue.message } : { path: [index], message: error.messageFa }));
  }
  return [{ path: ['mapping'], message: error.messageFa }];
};

/**
 * Slice Payload را برای Store اصلی می‌سازد و فقط Engine را صدا می‌زند.
 *
 * @param set - تابع تغییر وضعیت Zustand.
 * @param get - تابع خواندن وضعیت Zustand.
 * @returns اکشن‌های ساخت Payload.
 */
export const createPayloadSlice: WorkspaceSliceCreator<PayloadSlice> = (set, get) => ({
  buildPayload: () => {
    const state = get();
    if (state.activeMapping === null) {
      return { ok: false, error: new AppError({ code: 'MAPPING', messageFa: 'Mapping فعال برای ساخت Payload انتخاب نشده است.' }) };
    }

    const result = buildMappingPayload(state.draftTransaction, state.activeMapping);
    if (!result.ok) {
      set({ validation: { ...state.validation, mapping: toMappingIssues(result.error) } });
      return result;
    }

    set({ builtPayload: result.data.payload, validation: { ...state.validation, mapping: [] }, isDirty: false, lastBuiltAt: result.data.builtAt });
    return { ok: true, data: result.data.payload };
  },
  clearPayload: () => {
    set({ builtPayload: null, lastBuiltAt: null });
  },
});
