/**
 * هدف فایل: دسترسی Feature Mapping به Mapping فعال Workspace.
 * جایگاه معماری: features/mappings/hooks و لایه اتصال کنترل‌شده به Store.
 */
import { useActiveMapping as useWorkspaceActiveMapping } from '@/stores/selectors';

/**
 * Mapping فعال فعلی را از Store برمی‌گرداند.
 *
 * @returns Mapping فعال یا null.
 */
export function useActiveMapping(): ReturnType<typeof useWorkspaceActiveMapping> {
  return useWorkspaceActiveMapping();
}
