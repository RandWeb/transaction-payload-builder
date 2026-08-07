/**
 * هدف فایل: واسط Feature تراکنش برای ویرایش پیش‌نویس بدون کوپل مستقیم فرم به Store.
 * جایگاه معماری: features/transactions/hooks و مرز مصرف Workspace Store.
 */
import { useDraftTransaction, useTransactionActions, useWorkspaceDirtyState, useWorkspaceValidation } from '@/stores/selectors';

/**
 * وضعیت و اکشن‌های لازم برای ویرایشگر تراکنش را برمی‌گرداند.
 *
 * @returns داده پیش‌نویس، وضعیت dirty، خطاهای تراکنش و اکشن‌های ویرایش.
 */
export function useTransactionEditor(): ReturnType<typeof useTransactionActions> & {
  readonly draftTransaction: ReturnType<typeof useDraftTransaction>;
  readonly isDirty: boolean;
  readonly lastBuiltAt: string | null;
  readonly transactionIssues: ReturnType<typeof useWorkspaceValidation>['transaction'];
} {
  const draftTransaction = useDraftTransaction();
  const actions = useTransactionActions();
  const dirtyState = useWorkspaceDirtyState();
  const validation = useWorkspaceValidation();

  return {
    draftTransaction,
    isDirty: dirtyState.isDirty,
    lastBuiltAt: dirtyState.lastBuiltAt,
    transactionIssues: validation.transaction,
    ...actions,
  };
}

