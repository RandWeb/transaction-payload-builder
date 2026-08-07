/**
 * هدف فایل: Slice مدیریت پیش‌نویس تراکنش در Workspace Store.
 * جایگاه معماری: stores/slices و مسئول تغییرات کاربر روی `draftTransaction`.
 */
import { sampleTransaction, transactionSchema } from '@/features/transactions';
import type { Transaction, TransactionLeg } from '@/features/transactions';
import type { Template } from '@/features/templates';
import { AppError } from '@/shared/api/api-error';
import type { Result } from '@/shared/types/result.types';
import type { TransactionSlice, WorkspaceSliceCreator } from './workspace.types';

const parsedSampleTransaction = transactionSchema.parse(sampleTransaction);

export const initialDraftTransaction: Transaction = parsedSampleTransaction;

const readLeg = (transaction: Transaction, legIndex: number): Result<TransactionLeg> => {
  const leg = transaction.mainTransaction.attrsList[legIndex];
  if (leg !== undefined) return { ok: true, data: leg };
  return { ok: false, error: AppError.validation('ردیف تراکنش انتخاب‌شده وجود ندارد.') };
};

/**
 * Slice تراکنش را برای Store اصلی می‌سازد.
 *
 * @param set - تابع تغییر وضعیت Zustand.
 * @param get - تابع خواندن وضعیت Zustand.
 * @returns اکشن‌های ویرایش تراکنش.
 */
export const createTransactionSlice: WorkspaceSliceCreator<TransactionSlice> = (set, get) => ({
  setDraftTransaction: (transaction) => {
    set({ draftTransaction: transaction, builtPayload: null, isDirty: true, lastBuiltAt: null });
  },
  patchDraftTransaction: (patch) => {
    const current = get().draftTransaction;
    set({
      draftTransaction: { mainTransaction: { ...current.mainTransaction, ...patch } },
      builtPayload: null,
      isDirty: true,
      lastBuiltAt: null,
    });
  },
  addAttribute: (legIndex, key, value) => {
    const current = get().draftTransaction;
    const legResult = readLeg(current, legIndex);
    if (!legResult.ok) return legResult;
    const attrsList = current.mainTransaction.attrsList.map((leg, index) => (index === legIndex ? { ...leg, [key]: value } : leg));
    set({ draftTransaction: { mainTransaction: { ...current.mainTransaction, attrsList } }, builtPayload: null, isDirty: true, lastBuiltAt: null });
    return { ok: true, data: undefined };
  },
  updateAttribute: (legIndex, key, value) => {
    const current = get().draftTransaction;
    const legResult = readLeg(current, legIndex);
    if (!legResult.ok) return legResult;
    if (!(key in legResult.data)) return { ok: false, error: AppError.validation('فیلد انتخاب‌شده در ردیف تراکنش وجود ندارد.') };
    const attrsList = current.mainTransaction.attrsList.map((leg, index) => (index === legIndex ? { ...leg, [key]: value } : leg));
    set({ draftTransaction: { mainTransaction: { ...current.mainTransaction, attrsList } }, builtPayload: null, isDirty: true, lastBuiltAt: null });
    return { ok: true, data: undefined };
  },
  removeAttribute: (legIndex, key) => {
    const current = get().draftTransaction;
    const legResult = readLeg(current, legIndex);
    if (!legResult.ok) return legResult;
    const nextLeg = { ...legResult.data };
    delete nextLeg[key];
    const attrsList = current.mainTransaction.attrsList.map((leg, index) => (index === legIndex ? nextLeg : leg));
    set({ draftTransaction: { mainTransaction: { ...current.mainTransaction, attrsList } }, builtPayload: null, isDirty: true, lastBuiltAt: null });
    return { ok: true, data: undefined };
  },
  reorderAttribute: (fromIndex, toIndex) => {
    const current = get().draftTransaction;
    const attrsList = [...current.mainTransaction.attrsList];
    const [movedLeg] = attrsList.splice(fromIndex, 1);
    if (movedLeg === undefined || toIndex < 0 || toIndex > attrsList.length) {
      return { ok: false, error: AppError.validation('موقعیت جابه‌جایی تراکنش معتبر نیست.') };
    }
    attrsList.splice(toIndex, 0, movedLeg);
    set({ draftTransaction: { mainTransaction: { ...current.mainTransaction, attrsList } }, builtPayload: null, isDirty: true, lastBuiltAt: null });
    return { ok: true, data: undefined };
  },
  loadTransactionFromJson: (json) => {
    const result = transactionSchema.safeParse(json);
    if (!result.success) return { ok: false, error: AppError.validation('JSON تراکنش معتبر نیست.', result.error.issues) };
    set({ draftTransaction: result.data, builtPayload: null, isDirty: true, lastBuiltAt: null });
    return { ok: true, data: result.data };
  },
  resetDraft: () => {
    set({ draftTransaction: initialDraftTransaction, builtPayload: null, isDirty: false, lastBuiltAt: null });
  },
  loadFromTemplate: (template: Template) => {
    set({ draftTransaction: template.transaction, builtPayload: null, isDirty: true, lastBuiltAt: null });
  },
});
