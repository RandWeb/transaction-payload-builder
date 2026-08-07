/**
 * هدف فایل: Selectorهای اختصاصی Workspace برای کاهش Re-render غیرضروری.
 * جایگاه معماری: stores و API خواندن وضعیت برای UI و Hookها.
 */
import { useShallow } from 'zustand/react/shallow';

import { useWorkspaceStore } from '@/stores/workspace.store';
import type { WorkspaceStore } from '@/stores/workspace.store';

export const useDraftTransaction = (): WorkspaceStore['draftTransaction'] => useWorkspaceStore((state) => state.draftTransaction);
export const useActiveMapping = (): WorkspaceStore['activeMapping'] => useWorkspaceStore((state) => state.activeMapping);
export const useBuiltPayload = (): WorkspaceStore['builtPayload'] => useWorkspaceStore((state) => state.builtPayload);
export const useWorkspaceValidation = (): WorkspaceStore['validation'] => useWorkspaceStore((state) => state.validation);
export const useWorkspaceDirtyState = (): Pick<WorkspaceStore, 'isDirty' | 'lastBuiltAt'> =>
  useWorkspaceStore(useShallow((state) => ({ isDirty: state.isDirty, lastBuiltAt: state.lastBuiltAt })));

export const useTransactionActions = (): Pick<
  WorkspaceStore,
  | 'setDraftTransaction'
  | 'patchDraftTransaction'
  | 'addAttribute'
  | 'updateAttribute'
  | 'removeAttribute'
  | 'reorderAttribute'
  | 'loadTransactionFromJson'
  | 'resetDraft'
  | 'loadFromTemplate'
> =>
  useWorkspaceStore(
    useShallow((state) => ({
      setDraftTransaction: state.setDraftTransaction,
      patchDraftTransaction: state.patchDraftTransaction,
      addAttribute: state.addAttribute,
      updateAttribute: state.updateAttribute,
      removeAttribute: state.removeAttribute,
      reorderAttribute: state.reorderAttribute,
      loadTransactionFromJson: state.loadTransactionFromJson,
      resetDraft: state.resetDraft,
      loadFromTemplate: state.loadFromTemplate,
    })),
  );

export const usePayloadActions = (): Pick<WorkspaceStore, 'buildPayload' | 'clearPayload' | 'setActiveMapping' | 'setValidationIssues'> =>
  useWorkspaceStore(
    useShallow((state) => ({
      buildPayload: state.buildPayload,
      clearPayload: state.clearPayload,
      setActiveMapping: state.setActiveMapping,
      setValidationIssues: state.setValidationIssues,
    })),
  );

