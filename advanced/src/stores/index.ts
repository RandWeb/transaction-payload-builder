/**
 * هدف فایل: API عمومی Storeهای کلاینتی پروژه.
 * جایگاه معماری: مرز خروجی وضعیت Workspace برای مصرف کنترل‌شده در UI.
 */
export { useWorkspaceStore } from './workspace.store';
export type { ValidationIssue, WorkspaceState, WorkspaceStore } from './workspace.store';
export {
  useActiveMapping,
  useBuiltPayload,
  useDraftTransaction,
  usePayloadActions,
  useTransactionActions,
  useWorkspaceDirtyState,
  useWorkspaceValidation,
} from './selectors';

