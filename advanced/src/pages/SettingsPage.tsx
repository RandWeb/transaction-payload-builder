/**
 * هدف فایل: صفحه تنظیمات Placeholder شامل وضعیت API و تم.
 * جایگاه معماری: pages و مقصد مسیر `/settings`.
 */
import { useState } from 'react';

import { ApiStatusBadge } from '@/app/components/ApiStatusBadge';
import { ThemeToggle } from '@/app/components/ThemeToggle';
import { env } from '@/config/env';
import { PageHeader } from '@/shared/components/PageHeader';
import { Select } from '@/shared/components/ui';
import { getMockScenario, setMockScenario, type MockScenario } from '@/shared/api/mock/mock-scenarios';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';

export default function SettingsPage(): JSX.Element {
  useDocumentTitle('تنظیمات');
  const [mockScenario, updateMockScenario] = useState<MockScenario>(() => getMockScenario(env.VITE_MOCK_SCENARIO));

  const changeMockScenario = (scenario: MockScenario): void => {
    updateMockScenario(scenario);
    setMockScenario(scenario);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="تنظیمات" subtitle="تنظیم API، تم و دیتابیس در تسک‌های بعدی تکمیل می‌شود." />
      <section className="grid gap-4 rounded-xl border border-border bg-surface p-6 md:grid-cols-2">
        <div><h2 className="font-bold">تم</h2><div className="mt-3"><ThemeToggle /></div></div>
        <div className="space-y-3">
          <h2 className="font-bold">API</h2>
          <ApiStatusBadge />
          {env.VITE_USE_MOCK_API ? (
            <Select
              label="سناریوی Mock"
              value={mockScenario}
              onChange={(event) => changeMockScenario(event.target.value as MockScenario)}
              hint="این انتخاب در مرورگر ذخیره می‌شود و روی ارسال‌های آزمایشی اثر می‌گذارد."
              options={[
                { value: 'success', label: 'موفق' },
                { value: 'validation-error', label: 'خطای اعتبارسنجی' },
                { value: 'server-error', label: 'خطای سرور' },
                { value: 'timeout', label: 'Timeout' },
                { value: 'network-error', label: 'خطای شبکه' },
                { value: 'slow', label: 'پاسخ کند' },
              ]}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
