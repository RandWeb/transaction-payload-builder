/**
 * هدف فایل: نمایش وضعیت اتصال API بر اساس env.
 * جایگاه معماری: app/components و قابل تکمیل در تسک HTTP Client.
 */
import { env } from '@/config/env';
import { Badge } from '@/shared/components/ui/Badge';

/**
 * وضعیت Mock یا اتصال واقعی API را نشان می‌دهد.
 *
 * @returns Badge وضعیت API با آدرس پایه.
 * @example
 * <ApiStatusBadge />
 */
export function ApiStatusBadge(): JSX.Element {
  return (
    <Badge variant={env.VITE_USE_MOCK_API ? 'info' : 'success'}>
      {env.VITE_USE_MOCK_API ? `Mock فعال · ${env.VITE_API_BASE_URL}` : `اتصال واقعی: ${env.VITE_API_BASE_URL}`}
    </Badge>
  );
}
