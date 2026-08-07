/**
 * هدف فایل: ترکیب Sliceهای Workspace و Persist محدود پیش‌نویس کاربر.
 * جایگاه معماری: stores و وضعیت مرکزی میز کار کلاینتی.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { z } from 'zod';

import { transactionSchema } from '@/features/transactions';
import { createMappingSlice } from '@/stores/slices/mapping.slice';
import { createPayloadSlice } from '@/stores/slices/payload.slice';
import { createTransactionSlice, initialDraftTransaction } from '@/stores/slices/transaction.slice';
import type { WorkspaceState, WorkspaceStore } from '@/stores/slices/workspace.types';

const persistedWorkspaceSchema = z.object({
  state: z.object({
    draftTransaction: transactionSchema,
    isDirty: z.boolean(),
  }),
  version: z.number(),
});

const initialState: WorkspaceState = {
  draftTransaction: initialDraftTransaction,
  activeMapping: null,
  builtPayload: null,
  validation: { transaction: [], mapping: [] },
  isDirty: false,
  lastBuiltAt: null,
};

/**
 * Store میز کار را با Slice Pattern و Persist کنترل‌شده می‌سازد.
 *
 * @returns Hook اصلی Zustand برای وضعیت Workspace.
 */
export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (...api) => ({
      ...initialState,
      ...createTransactionSlice(...api),
      ...createMappingSlice(...api),
      ...createPayloadSlice(...api),
    }),
    {
      name: 'ftf:workspace',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ draftTransaction: state.draftTransaction, isDirty: state.isDirty }),
      migrate: (persistedState) => {
        const parsedState = persistedWorkspaceSchema.shape.state.safeParse(persistedState);
        return parsedState.success ? parsedState.data : { draftTransaction: initialDraftTransaction, isDirty: false };
      },
    },
  ),
);

export type { ValidationIssue, WorkspaceState, WorkspaceStore } from '@/stores/slices/workspace.types';

