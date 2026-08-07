/**
 * هدف فایل: ترکیب فرم Header، فرم Attribute، لیست Attributeها و ابزارهای Import/Export JSON برای ویرایش تراکنش.
 * جایگاه معماری: features/transactions/components و کانتینر UI ویرایشگر.
 */
import { useMemo, useState } from 'react';

import { Badge, Button, Select } from '@/shared/components/ui';
import { useActiveMapping, usePayloadActions } from '@/stores';
import type { Transaction } from '../types/transaction.types';
import { TransactionAttributeForm } from './TransactionAttributeForm';
import { TransactionAttributeList } from './TransactionAttributeList';
import { TransactionHeaderForm } from './TransactionHeaderForm';
import { TransactionJsonExport } from './TransactionJsonExport';
import { TransactionJsonImport } from './TransactionJsonImport';
import { useTransactionEditor } from '../hooks/useTransactionEditor';
import { createEmptyTransactionLeg } from '../utils/transaction-defaults';
import { normalizeAttributeValue, type TransactionAttributeValueType } from '../utils/transaction-normalizer';

/**
 * ویرایشگر کامل تراکنش را با حفظ ساختار دقیق `mainTransaction.attrsList` نمایش می‌دهد.
 *
 * @returns پنل ویرایش تراکنش برای صفحه Workspace.
 */
export function TransactionEditor(): JSX.Element {
  const editor = useTransactionEditor();
  const activeMapping = useActiveMapping();
  const { setValidationIssues } = usePayloadActions();
  const [selectedLegIndex, setSelectedLegIndex] = useState(0);
  const [editingName, setEditingName] = useState<string | undefined>();
  const selectedLeg = editor.draftTransaction.mainTransaction.attrsList[selectedLegIndex] ?? editor.draftTransaction.mainTransaction.attrsList[0] ?? createEmptyTransactionLeg();
  const legOptions = useMemo(
    () => editor.draftTransaction.mainTransaction.attrsList.map((_, index) => ({ value: String(index), label: `ردیف ${index + 1}` })),
    [editor.draftTransaction.mainTransaction.attrsList],
  );
  const transactionIssueCount = editor.transactionIssues.length;

  const addLeg = (): void => {
    editor.patchDraftTransaction({
      attrsList: [...editor.draftTransaction.mainTransaction.attrsList, createEmptyTransactionLeg()],
    });
    setSelectedLegIndex(editor.draftTransaction.mainTransaction.attrsList.length);
    setEditingName(undefined);
  };

  const submitAttribute = (name: string, type: TransactionAttributeValueType, rawValue: string, previousName?: string): void => {
    const normalizedValue = normalizeAttributeValue(type, rawValue);
    if (previousName !== undefined && previousName !== name) {
      const removeResult = editor.removeAttribute(selectedLegIndex, previousName);
      if (!removeResult.ok) {
        setValidationIssues({ transaction: [{ path: ['attrsList', selectedLegIndex, previousName], message: removeResult.error.messageFa }] });
        return;
      }
      editor.addAttribute(selectedLegIndex, name, normalizedValue);
    } else if (previousName !== undefined) {
      editor.updateAttribute(selectedLegIndex, name, normalizedValue);
    } else {
      editor.addAttribute(selectedLegIndex, name, normalizedValue);
    }
    setEditingName(undefined);
    setValidationIssues({ transaction: [] });
  };

  const deleteAttribute = (name: string): void => {
    const result = editor.removeAttribute(selectedLegIndex, name);
    if (!result.ok) {
      setValidationIssues({ transaction: [{ path: ['attrsList', selectedLegIndex, name], message: result.error.messageFa }] });
    }
  };

  const importTransaction = (transaction: Transaction): void => {
    const result = editor.loadTransactionFromJson(transaction);
    if (!result.ok) {
      setValidationIssues({ transaction: [{ path: ['mainTransaction'], message: result.error.messageFa }] });
      return;
    }
    setSelectedLegIndex(0);
    setEditingName(undefined);
    setValidationIssues({ transaction: [] });
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-text">ویرایشگر تراکنش</h1>
          <p className="text-sm text-secondary">ساختار JSON باید دقیقاً شامل mainTransaction و attrsList باشد.</p>
        </div>
        <Badge variant={transactionIssueCount === 0 ? 'success' : 'error'}>
          {transactionIssueCount === 0 ? 'معتبر' : `${transactionIssueCount} خطا`}
        </Badge>
      </div>

      <TransactionHeaderForm transaction={editor.draftTransaction} onSubmit={editor.setDraftTransaction} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,24rem)]">
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <Select label="ردیف attrsList" options={legOptions} value={String(selectedLegIndex)} onChange={(event) => setSelectedLegIndex(Number(event.target.value))} />
              <Button type="button" variant="outline" onClick={addLeg}>افزودن ردیف</Button>
            </div>
          </div>
          <TransactionAttributeForm
            leg={selectedLeg}
            activeMapping={activeMapping}
            editingName={editingName}
            onSubmit={submitAttribute}
            onCancelEdit={() => setEditingName(undefined)}
          />
          <TransactionAttributeList
            leg={selectedLeg}
            activeMapping={activeMapping}
            editingName={editingName}
            onEdit={setEditingName}
            onDelete={deleteAttribute}
          />
        </div>
        <aside className="space-y-4">
          <TransactionJsonImport currentTransaction={editor.draftTransaction} activeMapping={activeMapping} isDirty={editor.isDirty} onImport={importTransaction} />
          <TransactionJsonExport transaction={editor.draftTransaction} />
        </aside>
      </div>
    </section>
  );
}
