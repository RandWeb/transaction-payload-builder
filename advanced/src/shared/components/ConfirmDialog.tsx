/**
 * هدف فایل: دیالوگ تأیید عملیات حساس و برگشت‌ناپذیر.
 * جایگاه معماری: shared/components بر پایه Dialog و Button.
 */
import { Button } from '@/shared/components/ui/Button';
import { Dialog } from '@/shared/components/ui/Dialog';

export interface ConfirmDialogProps {
  readonly isOpen: boolean;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

/**
 * دیالوگ تأیید برای حذف، جایگزینی یا عملیات مخرب.
 *
 * @param props - متن‌ها و callback های تأیید/لغو.
 * @returns دیالوگ تأیید استاندارد.
 * @example
 * <ConfirmDialog isOpen title="حذف" message="ادامه می‌دهید؟" onConfirm={ok} onCancel={close} />
 */
export function ConfirmDialog({ isOpen, title, message, confirmLabel = 'تأیید', cancelLabel = 'لغو', onConfirm, onCancel }: ConfirmDialogProps): JSX.Element {
  return (
    <Dialog
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      footer={<><Button type="button" variant="ghost" onClick={onCancel}>{cancelLabel}</Button><Button type="button" variant="danger" onClick={onConfirm}>{confirmLabel}</Button></>}
    >
      <p className="leading-7 text-secondary">{message}</p>
    </Dialog>
  );
}
