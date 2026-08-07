/**
 * هدف فایل: Slice نگاشت فعال و خطاهای اعتبارسنجی Workspace.
 * جایگاه معماری: stores/slices و نگهدارنده وضعیت کلاینتی Mapping.
 */
import type { MappingSlice, WorkspaceSliceCreator } from './workspace.types';

/**
 * Slice Mapping را برای Store اصلی می‌سازد.
 *
 * @param set - تابع تغییر وضعیت Zustand.
 * @returns اکشن‌های نگاشت و اعتبارسنجی.
 */
export const createMappingSlice: WorkspaceSliceCreator<MappingSlice> = (set) => ({
  setActiveMapping: (mapping) => {
    set({ activeMapping: mapping, builtPayload: null, lastBuiltAt: null });
  },
  setValidationIssues: (issues) => {
    set((state) => ({ validation: { ...state.validation, ...issues } }));
  },
});

