/**
 * هدف فایل: تست Workspace Store برای عملیات پیش‌نویس، Payload و Persist.
 * جایگاه معماری: تست واحد stores برای وضعیت کلاینتی مرکزی.
 */
import { beforeEach, describe, expect, it } from 'vitest';

import { defaultMapping } from '@/features/mappings';
import type { Template } from '@/features/templates';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { initialDraftTransaction } from '@/stores/slices/transaction.slice';

const resetStore = (): void => {
  localStorage.clear();
  useWorkspaceStore.setState({
    draftTransaction: initialDraftTransaction,
    activeMapping: null,
    builtPayload: null,
    validation: { transaction: [], mapping: [] },
    isDirty: false,
    lastBuiltAt: null,
  });
};

describe('workspaceStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('باید Attribute را اضافه، ویرایش و حذف کند', () => {
    const addResult = useWorkspaceStore.getState().addAttribute(0, 'TestField', 'A');
    const updateResult = useWorkspaceStore.getState().updateAttribute(0, 'TestField', 'B');
    const removeResult = useWorkspaceStore.getState().removeAttribute(0, 'TestField');
    const firstLeg = useWorkspaceStore.getState().draftTransaction.mainTransaction.attrsList[0];

    expect(addResult.ok).toBe(true);
    expect(updateResult.ok).toBe(true);
    expect(removeResult.ok).toBe(true);
    expect(firstLeg?.TestField).toBeUndefined();
    expect(useWorkspaceStore.getState().isDirty).toBe(true);
  });

  it('باید Reset و Load از Template را انجام دهد', () => {
    const template: Template = {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'قالب تست',
      transaction: {
        mainTransaction: {
          ...initialDraftTransaction.mainTransaction,
          fraudMessageId: 'FR-TEMPLATE',
        },
      },
      createdAt: '2026-08-04T00:00:00.000Z',
      updatedAt: '2026-08-04T00:00:00.000Z',
    };

    useWorkspaceStore.getState().loadFromTemplate(template);
    expect(useWorkspaceStore.getState().draftTransaction.mainTransaction.fraudMessageId).toBe('FR-TEMPLATE');
    useWorkspaceStore.getState().resetDraft();
    expect(useWorkspaceStore.getState().draftTransaction).toEqual(initialDraftTransaction);
    expect(useWorkspaceStore.getState().isDirty).toBe(false);
  });

  it('باید JSON نامعتبر را رد کند و Store را خراب نکند', () => {
    const before = useWorkspaceStore.getState().draftTransaction;
    const result = useWorkspaceStore.getState().loadTransactionFromJson({ bad: true });

    expect(result.ok).toBe(false);
    expect(useWorkspaceStore.getState().draftTransaction).toEqual(before);
  });

  it('باید Payload را با Mapping دقیق docs بسازد و مقدارهای گمشده را رشته خالی بگذارد', () => {
    useWorkspaceStore.getState().setActiveMapping(defaultMapping);
    const result = useWorkspaceStore.getState().buildPayload();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Object.keys(result.data.attrsList[0] ?? {})).toEqual(Object.keys(defaultMapping));
      expect(result.data.attrsList[0]?.['997']).toBe('');
      expect(result.data.attrsList[0]?.['994']).toBe('');
    }
    expect(useWorkspaceStore.getState().isDirty).toBe(false);
  });

  it('باید Persist نامعتبر را به پیش‌فرض امن migrate کند', async () => {
    localStorage.setItem('ftf:workspace', JSON.stringify({ state: { draftTransaction: { bad: true }, isDirty: true }, version: 0 }));

    await useWorkspaceStore.persist.rehydrate();

    expect(useWorkspaceStore.getState().draftTransaction).toEqual(initialDraftTransaction);
    expect(useWorkspaceStore.getState().isDirty).toBe(false);
  });
});
