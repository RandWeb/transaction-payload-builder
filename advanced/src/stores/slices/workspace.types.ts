/**
 * هدف فایل: قرارداد مشترک Sliceهای Workspace Store.
 * جایگاه معماری: stores/slices و مرز تایپی Zustand برای میز کار.
 */
import type { StateCreator } from 'zustand';

import type { Mapping } from '@/features/mappings';
import type { Payload } from '@/features/payload';
import type { Template } from '@/features/templates';
import type { Transaction, TransactionLeg, TransactionValue } from '@/features/transactions';
import type { AppError } from '@/shared/api/api-error';
import type { Result } from '@/shared/types/result.types';

export interface ValidationIssue {
  readonly path: readonly (string | number)[];
  readonly message: string;
}

export interface WorkspaceState {
  readonly draftTransaction: Transaction;
  readonly activeMapping: Mapping | null;
  readonly builtPayload: Payload | null;
  readonly validation: {
    readonly transaction: readonly ValidationIssue[];
    readonly mapping: readonly ValidationIssue[];
  };
  readonly isDirty: boolean;
  readonly lastBuiltAt: string | null;
}

export interface TransactionSlice {
  readonly setDraftTransaction: (transaction: Transaction) => void;
  readonly patchDraftTransaction: (patch: Partial<Transaction['mainTransaction']>) => void;
  readonly addAttribute: (legIndex: number, key: string, value: TransactionValue) => Result<void>;
  readonly updateAttribute: (legIndex: number, key: string, value: TransactionValue) => Result<void>;
  readonly removeAttribute: (legIndex: number, key: string) => Result<void>;
  readonly reorderAttribute: (fromIndex: number, toIndex: number) => Result<void>;
  readonly loadTransactionFromJson: (json: unknown) => Result<Transaction>;
  readonly resetDraft: () => void;
  readonly loadFromTemplate: (template: Template) => void;
}

export interface MappingSlice {
  readonly setActiveMapping: (mapping: Mapping | null) => void;
  readonly setValidationIssues: (issues: Partial<WorkspaceState['validation']>) => void;
}

export interface PayloadSlice {
  readonly buildPayload: () => Result<Payload>;
  readonly clearPayload: () => void;
}

export type WorkspaceStore = WorkspaceState & TransactionSlice & MappingSlice & PayloadSlice;
export type WorkspaceSliceCreator<T> = StateCreator<WorkspaceStore, [['zustand/persist', unknown]], [], T>;
export type WorkspaceResult<T> = Result<T, AppError>;
export type WritableTransactionLeg = Record<string, TransactionLeg[string]>;

